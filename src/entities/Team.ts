import { BaseEntity } from './BaseEntity';
export class Team extends BaseEntity {
  name: string; description?: string; leaderId?: string; memberCount: number;
  constructor(id: string, name: string, description?: string, leaderId?: string) { super(id); this.name = name; this.description = description; this.leaderId = leaderId; this.memberCount = 0; }
  hasLeader(): boolean { return !!this.leaderId; }
  isEmpty(): boolean { return this.memberCount === 0; }
}
