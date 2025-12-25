export interface Entity { id: string; }
export interface IRepository<T extends Entity> { findById(id: string): Promise<T | null>; save(entity: T): Promise<void>; delete(id: string): Promise<void>; }
