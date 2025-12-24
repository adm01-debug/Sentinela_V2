import { Replica, ReplicaStatus } from './types';

export class ReplicaManager {
  private replicas: Map<string, Replica> = new Map();
  private primary?: Replica;
  
  addReplica(replica: Replica): void {
    this.replicas.set(replica.id, replica);
    if (replica.role === 'primary') this.primary = replica;
  }
  
  removeReplica(id: string): boolean { return this.replicas.delete(id); }
  getPrimary(): Replica | undefined { return this.primary; }
  
  getReadReplicas(): Replica[] {
    return Array.from(this.replicas.values()).filter(r => r.role === 'replica' && r.status === 'online');
  }
  
  updateStatus(id: string, status: ReplicaStatus, lag?: number): void {
    const replica = this.replicas.get(id);
    if (replica) { replica.status = status; if (lag !== undefined) replica.lag = lag; }
  }
  
  promoteToPrimary(id: string): void {
    const replica = this.replicas.get(id);
    if (replica && replica.role === 'replica') {
      if (this.primary) this.primary.role = 'replica';
      replica.role = 'primary';
      this.primary = replica;
    }
  }
}