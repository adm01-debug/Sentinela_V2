import { BaseEntity } from './BaseEntity';
export class Employee extends BaseEntity {
  userId: string; name: string; email: string; department: string; position: string; status: string; teamId?: string; hiredAt?: Date;
  constructor(id: string, userId: string, name: string, email: string, department: string, position: string, status = 'active') { super(id); this.userId = userId; this.name = name; this.email = email; this.department = department; this.position = position; this.status = status; }
  isActive(): boolean { return this.status === 'active'; }
  belongsToTeam(teamId: string): boolean { return this.teamId === teamId; }
}
