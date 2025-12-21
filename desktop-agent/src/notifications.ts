import { Notification, nativeImage, app } from 'electron';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  urgency?: 'normal' | 'critical' | 'low';
  onClick?: () => void;
}

class NotificationManager {
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  show(options: NotificationOptions) {
    if (!this.enabled || !Notification.isSupported()) {
      return null;
    }

    const notification = new Notification({
      title: options.title,
      body: options.body,
      icon: options.icon ? nativeImage.createFromPath(options.icon) : undefined,
      silent: options.silent ?? false,
      urgency: options.urgency ?? 'normal',
    });

    if (options.onClick) {
      notification.on('click', options.onClick);
    }

    notification.show();
    return notification;
  }

  showViolation(type: string, message: string) {
    this.show({
      title: 'Policy Violation Detected',
      body: `${type}: ${message}`,
      urgency: 'critical',
    });
  }

  showStatus(status: 'online' | 'offline') {
    this.show({
      title: 'Sentinela Agent',
      body: status === 'online' ? 'Agent is now connected' : 'Agent disconnected',
      silent: true,
    });
  }

  showReminder(message: string) {
    this.show({
      title: 'Reminder',
      body: message,
      urgency: 'low',
    });
  }
}

export const notifications = new NotificationManager();
