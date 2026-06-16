import React, { useState } from "react";
import {
  Fingerprint,
  Plus,
  Trash2,
  Smartphone,
  Laptop,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWebAuthn, WebAuthnCredential } from "@/hooks/useWebAuthn";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DeviceIcon({ type }: { type: string | null }) {
  switch (type?.toLowerCase()) {
    case "ios":
    case "android":
      return <Smartphone className="h-5 w-5" />;
    case "macos":
    case "windows":
    case "linux":
      return <Laptop className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
}

interface PasskeyItemProps {
  credential: WebAuthnCredential;
  onDelete: (id: string) => void;
  onRename: (params: { id: string; name: string }) => void;
}

const PasskeyItem = React.memo(function PasskeyItem({
  credential,
  onDelete,
  onRename,
}: PasskeyItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(credential.friendly_name || "");

  const handleRename = () => {
    if (newName.trim()) {
      onRename({ id: credential.id, name: newName.trim() });
      setIsRenaming(false);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 rounded-lg border p-4">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <DeviceIcon type={credential.device_type} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{credential.friendly_name || "Passkey"}</p>
            <Badge variant="outline">{credential.device_type || "Unknown"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Criada{" "}
            {formatDistanceToNow(new Date(credential.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
          {credential.last_used_at && (
            <p className="text-xs text-muted-foreground">
              Último uso:{" "}
              {format(new Date(credential.last_used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setNewName(credential.friendly_name || "");
              setIsRenaming(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover Passkey?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá a autenticação biométrica deste dispositivo. Você precisará usar
                  outro método de login.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(credential.id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Passkey</DialogTitle>
            <DialogDescription>Digite um nome para identificar esta credencial</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="passkey-name">Nome</Label>
            <Input
              id="passkey-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: iPhone do João"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export const WebAuthnSettings = React.memo(function WebAuthnSettings() {
  const {
    isSupported,
    isRegistering,
    credentials,
    credentialsLoading,
    hasPasskeys,
    registerPasskey,
    deletePasskey,
    renamePasskey,
  } = useWebAuthn();

  const [showRegister, setShowRegister] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");

  const handleRegister = async () => {
    const result = await registerPasskey(passkeyName || undefined);
    if (result.success) {
      setShowRegister(false);
      setPasskeyName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Passkeys / Biometria
        </CardTitle>
        <CardDescription>
          Use impressão digital, reconhecimento facial ou PIN do dispositivo para fazer login
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Card */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            {isSupported ? (
              hasPasskeys ? (
                <ShieldCheck className="h-8 w-8 text-green-500" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-yellow-500" />
              )
            ) : (
              <XCircle className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {!isSupported
                  ? "Não Suportado"
                  : hasPasskeys
                    ? "Passkeys Configuradas"
                    : "Nenhuma Passkey"}
              </p>
              <p className="text-sm text-muted-foreground">
                {!isSupported
                  ? "Seu dispositivo ou navegador não suporta WebAuthn"
                  : hasPasskeys
                    ? `${credentials.length} passkey(s) registrada(s)`
                    : "Configure para login mais rápido e seguro"}
              </p>
            </div>
          </div>
          <Badge variant={!isSupported ? "secondary" : hasPasskeys ? "default" : "outline"}>
            {!isSupported ? "Indisponível" : hasPasskeys ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {/* Supported Features */}
        {isSupported && (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Impressão Digital</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Face ID</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>PIN do Dispositivo</span>
            </div>
          </div>
        )}

        {/* Credentials List */}
        {credentialsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : credentials.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {credentials.map((credential) => (
                <PasskeyItem
                  key={credential.id}
                  credential={credential}
                  onDelete={(id: string) => deletePasskey(id)}
                  onRename={renamePasskey}
                />
              ))}
            </div>
          </ScrollArea>
        ) : isSupported ? (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <Fingerprint className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">Nenhuma passkey registrada ainda</p>
          </div>
        ) : null}

        {/* Register Button */}
        {isSupported && (
          <>
            <Button
              onClick={() => setShowRegister(true)}
              className="w-full"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Passkey
                </>
              )}
            </Button>

            <Dialog open={showRegister} onOpenChange={setShowRegister}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Registrar Nova Passkey
                  </DialogTitle>
                  <DialogDescription>
                    Use a autenticação biométrica do seu dispositivo para criar uma passkey
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="new-passkey-name">Nome da Passkey (opcional)</Label>
                    <Input
                      id="new-passkey-name"
                      value={passkeyName}
                      onChange={(e) => setPasskeyName(e.target.value)}
                      placeholder="Ex: MacBook do Trabalho"
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      Ao clicar em &quot;Registrar&quot;, você será solicitado a usar sua impressão
                      digital, reconhecimento facial ou PIN do dispositivo.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRegister(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleRegister} disabled={isRegistering}>
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aguardando...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Registrar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Info Box */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 font-medium">O que são Passkeys?</h4>
          <p className="text-sm text-muted-foreground">
            Passkeys são credenciais criptográficas armazenadas no seu dispositivo que permitem
            login sem senha usando biometria (impressão digital, Face ID) ou PIN. São mais seguras
            que senhas tradicionais e resistentes a phishing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
