export interface Points { userId: string; total: number; available: number; history: PointTransaction[]; }
export interface PointTransaction { amount: number; reason: string; date: Date; }