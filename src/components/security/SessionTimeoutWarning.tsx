import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSecurity } from '@/hooks/useSecurity';

interface SessionTimeoutWarningProps {
  onExtend: () => void;
}

export function SessionTimeoutWarning({ onExtend }: SessionTimeoutWarningProps) {
  const { showIdleWarning, updateActivity } = useSecurity();
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!showIdleWarning) {
      setCountdown(300);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showIdleWarning]);

  const handleExtend = () => {
    updateActivity();
    onExtend();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={showIdleWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Sessão Expirando</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Sua sessão irá expirar por inatividade em{' '}
              <span className="font-bold text-destructive">{formatTime(countdown)}</span>
            </p>
            <p className="text-sm">
              Clique no botão abaixo para continuar usando o sistema.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleExtend}>
            Continuar Sessão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
