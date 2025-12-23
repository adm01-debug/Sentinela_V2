import { BaseEntity } from './BaseEntity';
export class User extends BaseEntity {
  email: string; name: string; role: string; avatar?: string;
  constructor(id: string, email: string, name: string, role: string, createdAt?: Date) { super(id, createdAt); this.email = email; this.name = name; this.role = role; }
  isAdmin(): boolean { return ['admin', 'super_admin'].includes(this.role); }
  hasRole(role: string): boolean { return this.role === role; }
}
