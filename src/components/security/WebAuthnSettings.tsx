import React, { useState } from 'react';
import { useWebAuthn, WebAuthnCredential } from '@/hooks/useWebAuthn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  XCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type DeviceKind = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';

function normalizeDeviceType(type: string | null | undefined): DeviceKind {
  const t = type?.toLowerCase();
  if (t === 'ios' || t === 'android') return t;
  if (t === 'macos' || t === 'windows' || t === 'linux') return t;
  return 'unknown';
}

function DeviceIcon({ type }: { type: string | null }) {
  const kind = normalizeDeviceType(type);
  if (kind === 'ios' || kind === 'android') return <Smartphone className="h-5 w-5" aria-hidden="true" />;
  if (kind === 'macos' || kind === 'windows' || kind === 'linux') return <Laptop className="h-5 w-5" aria-hidden="true" />;
  return <Monitor className="h-5 w-5" aria-hidden="true" />;
}

function safeDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface PasskeyItemProps {
  credential: WebAuthnCredential;
  onDelete: (id: string) => void;
  onRename: (params: { id: string; name: string }) => void;
}

const PasskeyItem = React.memo(function PasskeyItem({ credential, onDelete, onRename }: PasskeyItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(credential.friendly_name || '');

  const handleRename = () => {
    if (newName.trim()) {
      onRename({ id: credential.id, name: newName.trim() });
      setIsRenaming(false);
    }
  };

  const createdAt = safeDate(credential.created_at);
  const lastUsedAt = safeDate(credential.last_used_at);
  const displayName = credential.friendly_name || 'Passkey';

  return (
    <>
      <li className="flex items-start gap-4 p-4 border rounded-lg">
        <div className="p-2 rounded-full bg-primary/10 text-primary" aria-hidden="true">
          <DeviceIcon type={credential.device_type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{displayName}</p>
            <Badge variant="outline">{credential.device_type || 'Desconhecido'}</Badge>
          </div>
          {createdAt && (
            <p className="text-sm text-muted-foreground">
              Criada{' '}
              <time dateTime={createdAt.toISOString()} title={format(createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}>
                {formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })}
              </time>
            </p>
          )}
          {lastUsedAt && (
            <p className="text-xs text-muted-foreground">
              Último uso:{' '}
              <time dateTime={lastUsedAt.toISOString()}>
                {format(lastUsedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </time>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Renomear ${displayName}`}
            onClick={() => {
              setNewName(credential.friendly_name || '');
              setIsRenaming(true);
            }}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Remover ${displayName}`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover {displayName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso removerá a autenticação biométrica deste dispositivo. Você precisará usar outro método de login.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(credential.id)} className="bg-destructive text-destructive-foreground">
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </li>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Passkey</DialogTitle>
            <DialogDescription>
              Digite um nome para identificar esta credencial
            </DialogDescription>
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
            <Button onClick={handleRename}>
              Salvar
            </Button>
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
  const [passkeyName, setPasskeyName] = useState('');

  const handleRegister = async () => {
    const result = await registerPasskey(passkeyName || undefined);
    if (result.success) {
      setShowRegister(false);
      setPasskeyName('');
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
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            {isSupported ? (
              hasPasskeys ? (
                <ShieldCheck className="h-8 w-8 text-success" />
              ) : (
                <ShieldAlert className="h-8 w-8 text-warning" />
              )
            ) : (
              <XCircle className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {!isSupported 
                  ? 'Não Suportado'
                  : hasPasskeys 
                    ? 'Passkeys Configuradas' 
                    : 'Nenhuma Passkey'}
              </p>
              <p className="text-sm text-muted-foreground">
                {!isSupported
                  ? 'Seu dispositivo ou navegador não suporta WebAuthn'
                  : hasPasskeys
                    ? `${credentials.length} passkey(s) registrada(s)`
                    : 'Configure para login mais rápido e seguro'}
              </p>
            </div>
          </div>
          <Badge variant={!isSupported ? 'secondary' : hasPasskeys ? 'default' : 'outline'}>
            {!isSupported ? 'Indisponível' : hasPasskeys ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {/* Supported Features */}
        {isSupported && (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Impressão Digital</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Face ID</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" />
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
            <ul className="space-y-3 pr-4" aria-label="Passkeys registradas">
              {credentials.map((credential) => (
                <PasskeyItem
                  key={credential.id}
                  credential={credential}
                  onDelete={deletePasskey}
                  onRename={renamePasskey}
                />
              ))}
            </ul>
          </ScrollArea>
        ) : isSupported ? (
          <div className="text-center py-8 border rounded-lg border-dashed">
            <Fingerprint className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Nenhuma passkey registrada ainda
            </p>
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
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
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="new-passkey-name">Nome da Passkey (opcional)</Label>
                    <Input
                      id="new-passkey-name"
                      value={passkeyName}
                      onChange={(e) => setPasskeyName(e.target.value)}
                      placeholder="Ex: MacBook do Trabalho"
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Ao clicar em "Registrar", você será solicitado a usar sua impressão digital, 
                      reconhecimento facial ou PIN do dispositivo.
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
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aguardando...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-4 w-4 mr-2" />
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
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">O que são Passkeys?</h4>
          <p className="text-sm text-muted-foreground">
            Passkeys são credenciais criptográficas armazenadas no seu dispositivo que permitem 
            login sem senha usando biometria (impressão digital, Face ID) ou PIN. São mais 
            seguras que senhas tradicionais e resistentes a phishing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
