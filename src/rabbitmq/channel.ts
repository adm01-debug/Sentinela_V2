import { QueueOptions, ConsumeOptions, PublishOptions } from './types';

export class ChannelPool {
  private channels: PooledChannel[] = [];
  private maxChannels: number;
  
  constructor(maxChannels: number = 10) { this.maxChannels = maxChannels; }
  
  async acquire(): Promise<PooledChannel> {
    const available = this.channels.find(c => !c.inUse);
    if (available) { available.inUse = true; return available; }
    if (this.channels.length < this.maxChannels) {
      const channel: PooledChannel = { id: this.channels.length, inUse: true };
      this.channels.push(channel);
      return channel;
    }
    throw new Error('No channels available');
  }
  
  release(channel: PooledChannel): void { channel.inUse = false; }
  
  getStats(): { total: number; inUse: number; available: number } {
    const inUse = this.channels.filter(c => c.inUse).length;
    return { total: this.channels.length, inUse, available: this.channels.length - inUse };
  }
}

export interface PooledChannel { id: number; inUse: boolean; }