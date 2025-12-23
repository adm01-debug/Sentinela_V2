export class UserDomain {
  constructor(public id: string, public email: string, public name: string, public role: string) {}
  isAdmin(): boolean { return ['admin', 'super_admin'].includes(this.role); }
  canManageUsers(): boolean { return this.isAdmin(); }
  canViewReports(): boolean { return true; }
  static create(data: any): UserDomain { return new UserDomain(data.id, data.email, data.name, data.role); }
}
