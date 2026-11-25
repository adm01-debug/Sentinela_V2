import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: unknown;
  actions?: { action: string; title: string; icon?: string }[];
}

const SERVICE_WORKER_PATH = "/push-sw.js";
const NOTIFICATION_ICON = "/pwa-192x192.png";

function getVapidPublicKey(): string {
  const value = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  return typeof value === "string" ? value.trim() : "";
}

/** A chave VAPID e base64url; `applicationServerKey` exige bytes. */
export function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function supportsPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

/**
 * `register()` com a mesma URL/escopo devolve a inscricao existente e nao
 * reinstala; por isso nao ha cache de modulo aqui (cache so criava estado
 * compartilhado entre navegacoes/testes).
 */
export async function ensurePushRegistration(): Promise<ServiceWorkerRegistration> {
  registrationPromise = navigator.serviceWorker
    .register(SERVICE_WORKER_PATH, { scope: "/" })
    .then(async (registration) => {
      await navigator.serviceWorker.ready;
      return registration.active ? registration : await navigator.serviceWorker.ready;
    })
    .catch((error) => {
      registrationPromise = null;
      throw error;
    });
  return registrationPromise;
}

export function usePWAPushNotifications() {
  const [isSupported] = useState(supportsPush);
  const isConfigured = getVapidPublicKey().length > 0;
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    isSupported ? Notification.permission : "denied"
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncSubscriptionToBackend = useCallback(async (sub: PushSubscription) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // user_id e obrigatorio: sem ele a RLS de push_subscriptions esconde a linha
    // do proprio usuario e a edge nao consegue entregar push para ninguem.
    const { error: upsertError } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: sub.endpoint,
        subscription: sub.toJSON() as unknown as Json,
        user_id: user?.id ?? null,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );
    if (upsertError) throw new Error(upsertError.message);
  }, []);

  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;
    ensurePushRegistration()
      .then((registration) => registration.pushManager.getSubscription())
      .then(async (existing) => {
        if (cancelled || !existing) return;
        setSubscription(existing);
        try {
          await syncSubscriptionToBackend(existing);
        } catch (syncError) {
          logger.warn("push: falha ao sincronizar inscricao existente", syncError);
        }
      })
      .catch((registrationError) => {
        if (!cancelled) logger.warn("push: service worker indisponivel", registrationError);
      });
    return () => {
      cancelled = true;
    };
  }, [isSupported, syncSubscriptionToBackend]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported) {
      setError("Este navegador nao suporta notificacoes push.");
      return null;
    }
    const vapidPublicKey = getVapidPublicKey();
    if (!vapidPublicKey) {
      setError("Push nao configurado neste ambiente (falta VITE_VAPID_PUBLIC_KEY).");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const currentPermission =
        Notification.permission === "default" ? await requestPermission() : Notification.permission;
      if (currentPermission !== "granted") {
        setError(
          "Permissao de notificacao bloqueada no navegador. Libere nas configuracoes do site."
        );
        return null;
      }

      const registration = await ensurePushRegistration();
      const existing = await registration.pushManager.getSubscription();
      const sub =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      await syncSubscriptionToBackend(sub);
      setSubscription(sub);
      setPermission(currentPermission);
      return sub;
    } catch (subscribeError) {
      const message =
        subscribeError instanceof Error
          ? subscribeError.message
          : "Falha ao ativar notificacoes push.";
      logger.error("push: falha ao inscrever", subscribeError);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, requestPermission, syncSubscriptionToBackend]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      const { error: deleteError } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint);
      if (deleteError) throw new Error(deleteError.message);
      setSubscription(null);
      return true;
    } catch (unsubscribeError) {
      const message =
        unsubscribeError instanceof Error
          ? unsubscribeError.message
          : "Falha ao desativar notificacoes push.";
      logger.error("push: falha ao desinscrever", unsubscribeError);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  const showLocalNotification = useCallback(
    (payload: PushNotificationPayload) => {
      if (permission !== "granted") return;
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon ?? NOTIFICATION_ICON,
        badge: payload.badge ?? NOTIFICATION_ICON,
        data: payload.data,
      });
    },
    [permission]
  );

  return {
    isSupported,
    isConfigured,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
    isSubscribed: !!subscription,
  };
}

export default usePWAPushNotifications;
