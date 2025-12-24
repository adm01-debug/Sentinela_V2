import { ChatMessage } from './messageHandler';
export interface ChatRoom { id: string; name: string; type: 'public' | 'private' | 'direct'; createdAt: Date; createdBy: string; participants: string[]; }
export class ChatRoomManager {
  private rooms = new Map<string, ChatRoom>();
  create(name: string, type: ChatRoom['type'], createdBy: string): ChatRoom { const room: ChatRoom = { id: crypto.randomUUID(), name, type, createdAt: new Date(), createdBy, participants: [createdBy] }; this.rooms.set(room.id, room); return room; }
  get(id: string): ChatRoom | undefined { return this.rooms.get(id); }
  addParticipant(roomId: string, userId: string): boolean { const room = this.rooms.get(roomId); if (!room) return false; if (!room.participants.includes(userId)) room.participants.push(userId); return true; }
  removeParticipant(roomId: string, userId: string): void { const room = this.rooms.get(roomId); if (room) room.participants = room.participants.filter(p => p !== userId); }
  list(): ChatRoom[] { return Array.from(this.rooms.values()); }
  getByUser(userId: string): ChatRoom[] { return this.list().filter(r => r.participants.includes(userId)); }
}
export const chatRoomManager = new ChatRoomManager();
