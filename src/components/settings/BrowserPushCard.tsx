import { BellRing, BellOff, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePWAPushNotifications } from "@/hooks/usePWAPushNotifications";

/**
 * Ativacao de push no navegador. A edge `send-push-notification` entrega Web
 * Push (VAPID) para quem tem inscricao em `push_subscriptions`; sem esta tela o
 * unico inscritor do repo ficava sem caminho de execucao e nenhum push chegava.
 */
export function BrowserPushCard() {
  const { toast } = useToast();
  const {
    isSupported,
    isConfigured,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePWAPushNotifications();

  const handleToggle = async (next: boolean) => {
    if (next) {
      const sub = await subscribe();
      if (sub) {
        toast({
          title: "Notificações ativadas",
          description: "Este dispositivo vai receber alertas em tempo real.",
        });
      } else {
        toast({
          title: "Não foi possível ativar",
          description: "Verifique a permissão de notificações do navegador.",
          variant: "destructive",
        });
      }
      return;
    }
    const ok = await unsubscribe();
    toast(
      ok
        ? {
            title: "Notificações desativadas",
            description: "Este dispositivo não recebe mais alertas.",
          }
        : { title: "Falha ao desativar", description: "Tente novamente.", variant: "destructive" }
    );
  };

  const blockedByPermission = permission === "denied";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <BellRing className="text-primary h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
          Notificações no navegador
        </CardTitle>
        <CardDescription>
          Receba alertas push neste dispositivo, mesmo com a aba fechada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="push-browser-toggle">
            {isSubscribed ? "Ativo neste dispositivo" : "Ativar neste dispositivo"}
          </Label>
          {isLoading ? (
            <Loader2
              className="text-muted-foreground h-4 w-4 animate-spin"
              data-testid="push-loading"
            />
          ) : (
            <Switch
              id="push-browser-toggle"
              data-testid="push-toggle"
              checked={isSubscribed}
              disabled={!isSupported || !isConfigured || blockedByPermission}
              onCheckedChange={handleToggle}
            />
          )}
        </div>

        {!isSupported && (
          <p className="text-muted-foreground text-sm" data-testid="push-unsupported">
            Este navegador não suporta notificações push.
          </p>
        )}

        {isSupported && !isConfigured && (
          <p className="text-muted-foreground text-sm" data-testid="push-not-configured">
            Push ainda não está configurado neste ambiente (falta a chave VAPID pública).
          </p>
        )}

        {isSupported && blockedByPermission && (
          <p
            className="text-muted-foreground flex items-start gap-2 text-sm"
            data-testid="push-blocked"
          >
            <ShieldAlert className="text-destructive mt-0.5 h-4 w-4" />
            Permissão bloqueada no navegador. Libere as notificações nas configurações do site e
            recarregue a página.
          </p>
        )}

        {error && (
          <p className="text-destructive text-sm" data-testid="push-error">
            {error}
          </p>
        )}

        {isSupported && isConfigured && !isSubscribed && !blockedByPermission && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggle(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BellRing className="mr-2 h-4 w-4" />
            )}
            Ativar notificações
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default BrowserPushCard;
