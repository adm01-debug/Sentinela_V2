export interface PushPayload { title: string; body: string; icon?: string; badge?: string; image?: string; data?: Record<string, any>; actions?: { action: string; title: string; icon?: string }[]; tag?: string; renotify?: boolean; requireInteraction?: boolean; }
export class PushPayloadBuilder {
  private payload: PushPayload = { title: '', body: '' };
  setTitle(title: string): this { this.payload.title = title; return this; }
  setBody(body: string): this { this.payload.body = body; return this; }
  setIcon(icon: string): this { this.payload.icon = icon; return this; }
  setImage(image: string): this { this.payload.image = image; return this; }
  setData(data: Record<string, any>): this { this.payload.data = data; return this; }
  addAction(action: string, title: string, icon?: string): this { if (!this.payload.actions) this.payload.actions = []; this.payload.actions.push({ action, title, icon }); return this; }
  build(): PushPayload { return { ...this.payload }; }
}
export const createPushPayload = () => new PushPayloadBuilder();
