import { useEffect, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSecurity } from '@/hooks/useSecurity';
import { Clock } from 'lucide-react';

interface SessionTimeoutWarningProps {
  /** Duração da contagem regressiva em segundos (padrão: 300s = 5min). */
  countdownSeconds?: number;
  onExtend: () => void;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SessionTimeoutWarning({
  countdownSeconds = 300,
  onExtend,
}: SessionTimeoutWarningProps) {
  const { showIdleWarning, updateActivity } = useSecurity();
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (!showIdleWarning) {
      setCountdown(countdownSeconds);
      return;
    }

    // Usa timestamp absoluto para evitar drift do setInterval
    const endsAt = Date.now() + countdownSeconds * 1000;
    setCountdown(countdownSeconds);

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) window.clearInterval(timer);
    }, 500);

    return () => window.clearInterval(timer);
  }, [showIdleWarning, countdownSeconds]);

  const handleExtend = useCallback(() => {
    updateActivity();
    onExtend();
  }, [updateActivity, onExtend]);

  const isCritical = countdown <= 30;

  return (
    <AlertDialog open={showIdleWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
            <AlertDialogTitle>Sessão expirando</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Sua sessão irá expirar por inatividade em{' '}
                <span
                  className={`font-bold tabular-nums text-destructive ${
                    isCritical ? 'motion-safe:animate-pulse' : ''
                  }`}
                  role="timer"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTime(countdown)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Clique no botão abaixo para continuar usando o sistema.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleExtend} autoFocus>
            Continuar sessão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
