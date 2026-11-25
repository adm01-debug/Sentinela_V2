import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { BrowserPushCard } from "@/components/settings/BrowserPushCard";
import { supabase } from "@/integrations/supabase/client";

const CHAVE_VAPID = "B".repeat(87);
const USER_ID = "user-1";

const upsert = vi.fn().mockResolvedValue({ data: null, error: null });
const deleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
const unsubscribe = vi.fn().mockResolvedValue(true);

function inscricaoFalsa() {
  return {
    endpoint: "https://push.test/abc",
    toJSON: () => ({
      endpoint: "https://push.test/abc",
      keys: { p256dh: "chave", auth: "segredo" },
    }),
    unsubscribe,
  };
}

function instalarNavegador({ permission = "granted" as NotificationPermission } = {}) {
  const pushManager = {
    getSubscription: vi.fn().mockResolvedValue(null),
    subscribe: vi.fn().mockResolvedValue(inscricaoFalsa()),
  };
  const registration = { active: true, pushManager };
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      register: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
    },
  });
  Object.defineProperty(window, "PushManager", {
    configurable: true,
    value: function PushManager() {},
  });
  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: Object.assign(function Notification() {}, {
      permission,
      requestPermission: vi.fn().mockResolvedValue("granted"),
    }),
  });
  return { pushManager, registration };
}

function removerNavegador() {
  delete (navigator as unknown as Record<string, unknown>).serviceWorker;
  delete (window as unknown as Record<string, unknown>).PushManager;
  delete (window as unknown as Record<string, unknown>).Notification;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("VITE_VAPID_PUBLIC_KEY", CHAVE_VAPID);
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: USER_ID } },
    error: null,
  } as never);
  vi.mocked(supabase.from).mockImplementation(
    () =>
      ({
        upsert,
        delete: () => ({ eq: deleteEq }),
      }) as unknown as ReturnType<typeof supabase.from>
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  removerNavegador();
});

describe("BrowserPushCard", () => {
  it("avisa quando o navegador nao suporta push e deixa o switch desabilitado", () => {
    removerNavegador();
    render(<BrowserPushCard />);

    expect(screen.getByTestId("push-unsupported")).toBeInTheDocument();
    expect(screen.getByTestId("push-toggle")).toBeDisabled();
  });

  it("avisa quando a chave VAPID publica nao esta configurada", () => {
    instalarNavegador();
    vi.stubEnv("VITE_VAPID_PUBLIC_KEY", "");
    render(<BrowserPushCard />);

    expect(screen.getByTestId("push-not-configured")).toBeInTheDocument();
    expect(screen.getByTestId("push-toggle")).toBeDisabled();
  });

  it("bloqueia a ativacao quando a permissao esta negada", () => {
    instalarNavegador({ permission: "denied" });
    render(<BrowserPushCard />);

    expect(screen.getByTestId("push-blocked")).toBeInTheDocument();
    expect(screen.getByTestId("push-toggle")).toBeDisabled();
  });

  it("grava a inscricao vinculada ao usuario e mostra o estado ativo", async () => {
    const { pushManager } = instalarNavegador({ permission: "default" });
    const usuario = userEvent.setup();
    render(<BrowserPushCard />);

    await usuario.click(screen.getByRole("button", { name: /ativar notifica/i }));

    await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
    expect(upsert.mock.calls[0][0]).toMatchObject({
      endpoint: "https://push.test/abc",
      user_id: USER_ID,
    });
    expect(upsert.mock.calls[0][1]).toEqual({ onConflict: "endpoint" });
    expect(pushManager.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      })
    );
    await waitFor(() => expect(screen.getByTestId("push-toggle")).toBeChecked());
  });

  it("desativa a inscricao e remove a linha do backend", async () => {
    const { pushManager } = instalarNavegador();
    pushManager.getSubscription.mockResolvedValue(inscricaoFalsa());
    const usuario = userEvent.setup();
    render(<BrowserPushCard />);

    await waitFor(() => expect(screen.getByTestId("push-toggle")).toBeChecked());
    await usuario.click(screen.getByTestId("push-toggle"));

    await waitFor(() => expect(unsubscribe).toHaveBeenCalledTimes(1));
    expect(deleteEq).toHaveBeenCalledWith("endpoint", "https://push.test/abc");
    await waitFor(() => expect(screen.getByTestId("push-toggle")).not.toBeChecked());
  });
});
