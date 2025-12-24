import { Alert } from './types';

export interface AlertNotifier { notify(alert: Alert): Promise<void>; }

export class EmailNotifier implements AlertNotifier {
  constructor(private recipients: string[]) {}
  async notify(alert: Alert): Promise<void> {
    console.log('Email to', this.recipients.join(','), ':', alert.message);
  }
}

export class SlackNotifier implements AlertNotifier {
  constructor(private webhookUrl: string) {}
  async notify(alert: Alert): Promise<void> {
    console.log('Slack notification:', alert.message);
  }
}

export class NotificationRouter {
  private notifiers: Map<string, AlertNotifier[]> = new Map();
  
  route(severity: string, notifier: AlertNotifier): void {
    const list = this.notifiers.get(severity) ?? [];
    list.push(notifier);
    this.notifiers.set(severity, list);
  }
  
  async dispatch(alert: Alert): Promise<void> {
    const notifiers = this.notifiers.get(alert.severity) ?? [];
    await Promise.all(notifiers.map(n => n.notify(alert)));
  }
}