export const accessRules = {
  canAccess: (userRole: string, resource: string, action: string): boolean => { const permissions: Record<string, Record<string, string[]>> = { admin: { employees: ['read', 'create', 'update', 'delete'], reports: ['read', 'create', 'export'] }, manager: { employees: ['read', 'update'], reports: ['read', 'create'] }, employee: { reports: ['read'] } }; return permissions[userRole]?.[resource]?.includes(action) ?? false; },
  canViewEmployee: (viewer: any, employee: any): boolean => { if (viewer.role === 'admin') return true; if (viewer.role === 'manager' && viewer.teamId === employee.teamId) return true; return viewer.id === employee.userId; },
  isOwner: (userId: string, resourceOwnerId: string): boolean => userId === resourceOwnerId,
};
