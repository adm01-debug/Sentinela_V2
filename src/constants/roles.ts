export const ROLES = { ADMIN: "admin", MANAGER: "manager", USER: "user", VIEWER: "viewer" } as const;
export type Role = typeof ROLES[keyof typeof ROLES];
