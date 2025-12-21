export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  recipientId: string;
  subject?: string;
  body: string;
  read: boolean;
  sentAt: string;
  readAt?: string;
}