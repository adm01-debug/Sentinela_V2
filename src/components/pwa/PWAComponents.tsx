import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download,
  X,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  Loader2,
  Share,
  Home,
  Zap,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// ============================================
// TYPES
// ============================================
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ============================================
// ENHANCED PWA INSTALL PROMPT
// ============================================
interface PWAInstallPromptEnhancedProps {
  delay?: number;
  onInstall?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function PWAInstallPromptEnhanced({
  delay = 30000,
  onInstall,
  onDismiss,
  className,
}: PWAInstallPromptEnhancedProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      onInstall?.();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [delay, onInstall]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        onInstall?.();
      }
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    onDismiss?.();
  }, [onDismiss]);

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className={cn('fixed bottom-4 right-4 z-50', className)}
      >
        <Card className="w-80 shadow-2xl border-primary/20 overflow-hidden">
          {/* Gradient header */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
          
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="p-2 rounded-lg bg-primary/10"
                >
                  <Smartphone className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <CardTitle className="text-base">Instalar Sentinela</CardTitle>
                  <CardDescription className="text-xs">
                    Experiência completa no seu dispositivo
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">Acesso Rápido</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <WifiOff className="h-4 w-4 text-blue-500" />
                <span className="text-xs">Modo Offline</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Bell className="h-4 w-4 text-green-500" />
                <span className="text-xs">Notificações</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Home className="h-4 w-4 text-purple-500" />
                <span className="text-xs">Tela Inicial</span>
              </div>
            </div>

            {/* iOS instructions */}
            {platform === 'ios' && !installPrompt && (
              <div className="p-3 rounded-lg bg-muted/50 text-xs">
                <p className="font-medium mb-2">Para instalar no iOS:</p>
                <ol className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">1</span>
                    Toque em <Share className="h-3 w-3 inline mx-1" /> Compartilhar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">2</span>
                    Selecione "Adicionar à Tela de Início"
                  </li>
                </ol>
              </div>
            )}

            {/* Install button */}
            {installPrompt && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall} 
                  className="flex-1"
                  disabled={isInstalling}
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Instalando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Instalar Agora
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Depois
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// OFFLINE PAGE COMPONENT
// ============================================
interface OfflinePageProps {
  onRetry?: () => void;
  cachedPages?: Array<{ title: string; url: string }>;
  className?: string;
}

export function OfflinePage({
  onRetry,
  cachedPages = [],
  className,
}: OfflinePageProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (navigator.onLine) {
      window.location.reload();
    }
    
    setIsRetrying(false);
    onRetry?.();
  }, [onRetry]);

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4 bg-background',
      className
    )}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6"
        >
          <CloudOff className="h-12 w-12 text-muted-foreground" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">Você está offline</h1>
        <p className="text-muted-foreground mb-6">
          Não foi possível conectar à internet. Verifique sua conexão e tente novamente.
        </p>

        <Button onClick={handleRetry} disabled={isRetrying} className="mb-6">
          {isRetrying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando conexão...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </>
          )}
        </Button>

        {cachedPages.length > 0 && (
          <div className="text-left">
            <h3 className="text-sm font-medium mb-3">Páginas disponíveis offline:</h3>
            <div className="space-y-2">
              {cachedPages.map((page, index) => (
                <a
                  key={index}
                  href={page.url}
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{page.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ============================================
// SYNC INDICATOR COMPONENT
// ============================================
type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

interface SyncIndicatorProps {
  status: SyncStatus;
  pendingCount?: number;
  lastSyncTime?: Date;
  onSync?: () => void;
  className?: string;
}

const syncStatusConfig: Record<SyncStatus, { icon: React.ElementType; label: string; color: string }> = {
  synced: { icon: CheckCircle2, label: 'Sincronizado', color: 'text-green-500' },
  syncing: { icon: RefreshCw, label: 'Sincronizando...', color: 'text-blue-500' },
  pending: { icon: Cloud, label: 'Pendente', color: 'text-yellow-500' },
  error: { icon: AlertTriangle, label: 'Erro de sincronização', color: 'text-red-500' },
  offline: { icon: WifiOff, label: 'Offline', color: 'text-muted-foreground' },
};

export function SyncIndicator({
  status,
  pendingCount = 0,
  lastSyncTime,
  onSync,
  className,
}: SyncIndicatorProps) {
  const config = syncStatusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background',
      className
    )}>
      <motion.div
        animate={status === 'syncing' ? { rotate: 360 } : {}}
        transition={status === 'syncing' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
      </motion.div>
      
      <span className="text-xs font-medium">{config.label}</span>
      
      {pendingCount > 0 && status === 'pending' && (
        <Badge variant="secondary" className="text-[10px] h-5">
          {pendingCount}
        </Badge>
      )}
      
      {status === 'error' && onSync && (
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onSync}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
      
      {lastSyncTime && status === 'synced' && (
        <span className="text-[10px] text-muted-foreground">
          {formatTime(lastSyncTime)}
        </span>
      )}
    </div>
  );
}

// ============================================
// PUSH NOTIFICATION OPT-IN COMPONENT
// ============================================
interface PushNotificationOptInProps {
  onEnable?: () => void;
  onDisable?: () => void;
  className?: string;
}

export function PushNotificationOptIn({
  onEnable,
  onDisable,
  className,
}: PushNotificationOptInProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Este navegador não suporta notificações');
      return;
    }

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        onEnable?.();
        // Show test notification
        new Notification('Notificações Ativadas!', {
          body: 'Você receberá alertas importantes do Sentinela.',
          icon: '/logo-192.png',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [onEnable]);

  const handleDisable = useCallback(() => {
    onDisable?.();
    setShowSettings(true);
  }, [onDisable]);

  if (permission === 'denied') {
    return (
      <Card className={cn('border-destructive/50', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BellOff className="h-5 w-5 text-destructive" />
            Notificações Bloqueadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            As notificações foram bloqueadas. Para reativá-las, acesse as configurações do navegador.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Ver Instruções
          </Button>
          
          {showSettings && (
            <div className="mt-4 p-3 rounded-lg bg-muted text-xs space-y-2">
              <p className="font-medium">Para desbloquear notificações:</p>
              <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                <li>Clique no ícone de cadeado na barra de endereços</li>
                <li>Encontre "Notificações" nas permissões</li>
                <li>Altere para "Permitir"</li>
                <li>Recarregue a página</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className={cn(
            'h-5 w-5',
            permission === 'granted' ? 'text-green-500' : 'text-muted-foreground'
          )} />
          Notificações Push
        </CardTitle>
        <CardDescription>
          {permission === 'granted' 
            ? 'Você receberá alertas importantes'
            : 'Receba alertas em tempo real'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Alertas de violação de políticas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Notificações de geofence
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Atualizações de status do sistema
              </li>
            </ul>
            <Button onClick={requestPermission} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Ativar Notificações
            </Button>
          </>
        )}

        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-alerts">Alertas críticos</Label>
              <Switch id="push-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-violations">Violações</Label>
              <Switch id="push-violations" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-updates">Atualizações do sistema</Label>
              <Switch id="push-updates" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// UPDATE AVAILABLE BANNER
// ============================================
interface UpdateBannerProps {
  version?: string;
  onUpdate?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function UpdateBanner({
  version,
  onUpdate,
  onDismiss,
  className,
}: UpdateBannerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpdate = useCallback(async () => {
    setIsUpdating(true);
    
    // Simulate update progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }
    
    onUpdate?.();
    window.location.reload();
  }, [onUpdate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        {isUpdating ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Atualizando...
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <RefreshCw className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="font-medium text-sm">
                  Nova versão disponível{version && ` (v${version})`}
                </p>
                <p className="text-xs opacity-80">
                  Atualize para ter acesso aos novos recursos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleUpdate}
              >
                Atualizar Agora
              </Button>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={onDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// CONNECTION STATUS ENHANCED
// ============================================
interface ConnectionStatusProps {
  showWhenOnline?: boolean;
  className?: string;
}

export function ConnectionStatusEnhanced({
  showWhenOnline = false,
  className,
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected && !showWhenOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm flex items-center justify-center gap-2',
          isOnline 
            ? showReconnected 
              ? 'bg-green-500 text-white' 
              : 'bg-green-500/10 text-green-700'
            : 'bg-destructive text-destructive-foreground',
          className
        )}
      >
        {isOnline ? (
          showReconnected ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Conexão restabelecida!
            </>
          ) : (
            <>
              <Wifi className="h-4 w-4" />
              Conectado
            </>
          )
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Export types
export type { SyncStatus };
