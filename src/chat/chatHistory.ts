import { ChatMessage } from './messageHandler';
export class ChatHistory {
  private messages = new Map<string, ChatMessage[]>();
  private limit = 1000;
  setLimit(limit: number): void { this.limit = limit; }
  add(message: ChatMessage): void { if (!this.messages.has(message.roomId)) this.messages.set(message.roomId, []); const room = this.messages.get(message.roomId)!; room.push(message); if (room.length > this.limit) room.shift(); }
  get(roomId: string, limit = 50, before?: Date): ChatMessage[] { const messages = this.messages.get(roomId) || []; let filtered = before ? messages.filter(m => m.timestamp < before) : messages; return filtered.slice(-limit); }
  search(roomId: string, query: string): ChatMessage[] { const messages = this.messages.get(roomId) || []; return messages.filter(m => m.content.toLowerCase().includes(query.toLowerCase())); }
  clear(roomId: string): void { this.messages.delete(roomId); }
  export(roomId: string): string { return JSON.stringify(this.messages.get(roomId) || [], null, 2); }
}
export const chatHistory = new ChatHistory();
