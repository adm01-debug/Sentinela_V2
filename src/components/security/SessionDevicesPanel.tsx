import { AlertTriangle, Laptop, LogOut, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionManager } from "@/hooks/useSessionManager";

function formatMoment(value: Date): string {
  if (Number.isNaN(value.getTime())) return "-";
  return format(value, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function SessionDevicesPanel() {
  const {
    sessions,
    isLoading,
    isError,
    loadError,
    error,
    clearError,
    refresh,
    isRefreshing,
    revokeSession,
    revokeAllOtherSessions,
    isRevoking,
  } = useSessionManager();

  const others = sessions.filter((session) => !session.current);

  return (
    <div className="space-y-4">
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>O que esta lista mostra</AlertTitle>
        <AlertDescription>
          Cada linha e um dispositivo que acessou sua conta. Encerrar uma linha remove o registro
          desta trilha; o acesso ja autorizado naquele aparelho so deixa de valer quando o token
          expira, porque a revogacao imediata do login depende do provedor de autenticacao. Use isto
          para identificar acessos que voce nao reconhece e troque a senha em caso de duvida.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nao foi possivel concluir</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Falha ao carregar os dispositivos</AlertTitle>
          <AlertDescription>{loadError ?? "Erro desconhecido"}</AlertDescription>
        </Alert>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
          <Laptop className="text-muted-foreground h-6 w-6" aria-hidden="true" />
          <p className="text-sm font-medium">Nenhum dispositivo registrado ainda</p>
          <p className="text-muted-foreground text-sm">
            O dispositivo que voce esta usando agora e registrado automaticamente na primeira carga
            desta pagina.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Navegador</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Ultimo acesso</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        {session.device}
                        {session.current && <Badge variant="default">Este dispositivo</Badge>}
                      </span>
                    </TableCell>
                    <TableCell>{session.browser}</TableCell>
                    <TableCell className="font-mono text-xs">{session.ip}</TableCell>
                    <TableCell>{session.location ?? "-"}</TableCell>
                    <TableCell>{formatMoment(session.lastActivity)}</TableCell>
                    <TableCell className="text-right">
                      {session.current ? (
                        <span className="text-muted-foreground text-xs">em uso</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isRevoking}
                          onClick={() => {
                            void revokeSession(session.id);
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Encerrar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => void refresh()} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Atualizar lista
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={others.length === 0 || isRevoking}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Encerrar os outros ({others.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar os outros dispositivos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Os {others.length} dispositivos diferentes deste serao removidos da sua lista de
                    acessos. O dispositivo atual continua registrado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void revokeAllOtherSessions()}>
                    Encerrar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}

export default SessionDevicesPanel;
