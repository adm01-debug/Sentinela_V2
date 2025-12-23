import { Role } from './roles';
import { Permission } from './permissions';
import { hasPermission } from './policies';
export class Ability {
  constructor(private role: Role) {}
  can(permission: Permission): boolean { return hasPermission(this.role, permission); }
  cannot(permission: Permission): boolean { return !this.can(permission); }
  canAll(permissions: Permission[]): boolean { return permissions.every(p => this.can(p)); }
  canAny(permissions: Permission[]): boolean { return permissions.some(p => this.can(p)); }
}
export function defineAbility(role: Role): Ability { return new Ability(role); }
