import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NotificationContextValue {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  sendTestNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  showPrompt?: boolean;
  promptDelay?: number;
}

export function NotificationProvider({ children, showPrompt = true, promptDelay = 5000 }: NotificationProviderProps) {
  const { isSupported, permission, isSubscribed, requestPermission, subscribe, unsubscribe, showNotification } = usePushNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (showPrompt && isSupported && permission === 'default' && !dismissed) {
      const timer = setTimeout(() => setShowBanner(true), promptDelay);
      return () => clearTimeout(timer);
    }
  }, [showPrompt, isSupported, permission, dismissed, promptDelay]);

  const enableNotifications = useCallback(async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      await subscribe();
      setShowBanner(false);
      return true;
    }
    return false;
  }, [requestPermission, subscribe]);

  const disableNotifications = useCallback(async () => {
    await unsubscribe();
  }, [unsubscribe]);

  const sendTestNotification = useCallback(() => {
    showNotification('Test Notification', {
      body: 'This is a test notification from Sentinela',
      icon: '/icons/icon-192x192.png',
    });
  }, [showNotification]);

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  const value: NotificationContextValue = {
    isSupported,
    isEnabled: isSubscribed,
    permission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Enable Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get real-time alerts for security events and important updates.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={enableNotifications}>Enable</Button>
                    <Button size="sm" variant="ghost" onClick={handleDismiss}>Not now</Button>
                  </div>
                </div>
                <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
