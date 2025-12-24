export interface ChatMessage { id: string; roomId: string; userId: string; content: string; timestamp: Date; type: 'text' | 'image' | 'file' | 'system'; edited?: boolean; }
export class MessageHandler {
  private handlers: ((msg: ChatMessage) => void)[] = [];
  onMessage(handler: (msg: ChatMessage) => void): void { this.handlers.push(handler); }
  send(roomId: string, userId: string, content: string, type: ChatMessage['type'] = 'text'): ChatMessage { const message: ChatMessage = { id: crypto.randomUUID(), roomId, userId, content, timestamp: new Date(), type }; this.handlers.forEach(h => h(message)); return message; }
  edit(message: ChatMessage, newContent: string): ChatMessage { return { ...message, content: newContent, edited: true }; }
  validate(content: string, maxLength: number): boolean { return content.length > 0 && content.length <= maxLength; }
}
export const messageHandler = new MessageHandler();
