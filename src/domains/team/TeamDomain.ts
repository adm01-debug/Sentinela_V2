export class TeamDomain {
  constructor(public id: string, public name: string, public leaderId?: string, public memberCount = 0) {}
  hasLeader(): boolean { return !!this.leaderId; }
  isEmpty(): boolean { return this.memberCount === 0; }
  canAddMember(): boolean { return this.memberCount < 50; }
  static create(data: any): TeamDomain { return new TeamDomain(data.id, data.name, data.leaderId, data.memberCount); }
}
