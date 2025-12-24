export interface ChatConfig { maxMessageLength: number; maxParticipants: number; historyLimit: number; }
export class ChatService {
  private config: ChatConfig = { maxMessageLength: 5000, maxParticipants: 100, historyLimit: 1000 };
  private rooms = new Map<string, Set<string>>();
  configure(config: Partial<ChatConfig>): void { Object.assign(this.config, config); }
  createRoom(roomId: string): void { this.rooms.set(roomId, new Set()); }
  joinRoom(roomId: string, userId: string): boolean { const room = this.rooms.get(roomId); if (!room || room.size >= this.config.maxParticipants) return false; room.add(userId); return true; }
  leaveRoom(roomId: string, userId: string): void { this.rooms.get(roomId)?.delete(userId); }
  getParticipants(roomId: string): string[] { return Array.from(this.rooms.get(roomId) || []); }
  deleteRoom(roomId: string): void { this.rooms.delete(roomId); }
}
export const chatService = new ChatService();
