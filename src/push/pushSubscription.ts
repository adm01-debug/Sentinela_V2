export interface StoredSubscription { id: string; userId: string; endpoint: string; keys: { p256dh: string; auth: string }; createdAt: Date; }
export class PushSubscriptionManager {
  private subscriptions = new Map<string, StoredSubscription>();
  save(userId: string, subscription: PushSubscription): StoredSubscription { const keys = subscription.toJSON().keys!; const stored: StoredSubscription = { id: crypto.randomUUID(), userId, endpoint: subscription.endpoint, keys: { p256dh: keys.p256dh!, auth: keys.auth! }, createdAt: new Date() }; this.subscriptions.set(userId, stored); return stored; }
  get(userId: string): StoredSubscription | undefined { return this.subscriptions.get(userId); }
  remove(userId: string): boolean { return this.subscriptions.delete(userId); }
  list(): StoredSubscription[] { return Array.from(this.subscriptions.values()); }
}
export const pushSubscriptionManager = new PushSubscriptionManager();
