export const STATUS = { ACTIVE: "active", INACTIVE: "inactive", PENDING: "pending", BLOCKED: "blocked" } as const;
export type Status = typeof STATUS[keyof typeof STATUS];
