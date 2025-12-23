interface NotificationConfig { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; duration?: number; action?: { label: string; onClick: () => void }; }
export class NotificationBuilder {
  private config: Partial<NotificationConfig> = { type: 'info', duration: 5000 };
  title(t: string) { this.config.title = t; return this; }
  message(m: string) { this.config.message = m; return this; }
  type(t: NotificationConfig['type']) { this.config.type = t; return this; }
  duration(d: number) { this.config.duration = d; return this; }
  action(label: string, onClick: () => void) { this.config.action = { label, onClick }; return this; }
  success() { return this.type('success'); }
  error() { return this.type('error'); }
  warning() { return this.type('warning'); }
  build() { return this.config as NotificationConfig; }
}
