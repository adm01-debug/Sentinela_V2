export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gerente',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.EMPLOYEE]: 'Colaborador',
  [UserRole.VIEWER]: 'Visualizador',
};
