export class EmployeeDomain {
  constructor(public id: string, public name: string, public email: string, public department: string, public status: string, public teamId?: string) {}
  isActive(): boolean { return this.status === 'active'; }
  canBeDeleted(): boolean { return this.status !== 'active'; }
  belongsToTeam(teamId: string): boolean { return this.teamId === teamId; }
  static create(data: any): EmployeeDomain { return new EmployeeDomain(data.id, data.name, data.email, data.department, data.status, data.teamId); }
}
