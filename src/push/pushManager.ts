export interface PushConfig { vapidPublicKey: string; vapidPrivateKey: string; subject: string; }
export class PushManager {
  private config: PushConfig | null = null;
  private subscriptions = new Map<string, PushSubscription>();
  configure(config: PushConfig): void { this.config = config; }
  async requestPermission(): Promise<NotificationPermission> { return Notification.requestPermission(); }
  async subscribe(): Promise<PushSubscription | null> { if (!('serviceWorker' in navigator)) return null; const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: this.config?.vapidPublicKey }); return sub; }
  addSubscription(userId: string, subscription: PushSubscription): void { this.subscriptions.set(userId, subscription); }
  getSubscription(userId: string): PushSubscription | undefined { return this.subscriptions.get(userId); }
}
export const pushManager = new PushManager();
