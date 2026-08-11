import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface SecurityViolation {
  id: string;
  violation_type: string;
  severity: string;
  employee_name: string;
  policy_name: string;
  description: string | null;
  created_at: string;
  device: string | null;
  ip_address: string | null;
}

type NotificationPermission = 'default' | 'granted' | 'denied';

export function useSecurityNotifications() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    const supported = 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
      setIsSubscribed(Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      setIsSubscribed(result === 'granted');

      if (result === 'granted') {
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá alertas de segurança em tempo real.',
        });
        
        // Send test notification
        showNotification('Notificações ativadas', {
          body: 'Você receberá alertas de segurança em tempo real.',
          icon: '/favicon.ico',
          tag: 'test-notification',
        });
        
        return true;
      } else if (result === 'denied') {
        toast({
          title: 'Notificações bloqueadas',
          description: 'Você bloqueou as notificações. Ative-as nas configurações do navegador.',
          variant: 'destructive',
        });
        return false;
      }
      
      return false;
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      toast({
        title: 'Erro ao solicitar permissão',
        description: 'Não foi possível solicitar permissão para notificações.',
        variant: 'destructive',
      });
      return false;
    }
  }, [isSupported, toast]);

  // Show a notification
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      logger.info('Notifications not available or not permitted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      logger.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  // Show security alert notification
  const showSecurityAlert = useCallback((violation: SecurityViolation) => {
    const severityEmoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    }[violation.severity] || '🔔';

    const severityLabel = {
      critical: 'CRÍTICO',
      high: 'ALTO',
      medium: 'MÉDIO',
      low: 'BAIXO',
    }[violation.severity] || violation.severity.toUpperCase();

    showNotification(`${severityEmoji} Alerta de Segurança - ${severityLabel}`, {
      body: `${violation.policy_name}\n${violation.employee_name}${violation.device ? ` • ${violation.device}` : ''}`,
      tag: `security-alert-${violation.id}`,
      data: { violationId: violation.id },
      requireInteraction: violation.severity === 'critical' || violation.severity === 'high',
    });

    // Also show a toast for in-app notification
    toast({
      title: `${severityEmoji} ${violation.policy_name}`,
      description: `${violation.employee_name} - ${violation.description || violation.violation_type}`,
      variant: violation.severity === 'critical' || violation.severity === 'high' ? 'destructive' : 'default',
    });
  }, [showNotification, toast]);

  // Subscribe to realtime security violations
  useEffect(() => {
    if (!isSubscribed) return;

    logger.info('Subscribing to security violations realtime...');

    const channel = supabase
      .channel('security-violations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_violations',
        },
        (payload) => {
          logger.info('New security violation:', payload);
          const violation = payload.new as SecurityViolation;
          showSecurityAlert(violation);
        }
      )
      .subscribe((status) => {
        logger.info('Realtime subscription status:', status);
      });

    return () => {
      logger.info('Unsubscribing from security violations realtime...');
      supabase.removeChannel(channel);
    };
  }, [isSubscribed, showSecurityAlert]);

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    showNotification,
    showSecurityAlert,
  };
}
