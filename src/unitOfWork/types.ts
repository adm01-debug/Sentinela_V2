export interface Entity { id: string; }
export interface IUnitOfWork { registerNew(entity: Entity): void; registerDirty(entity: Entity): void; registerDeleted(entity: Entity): void; commit(): Promise<void>; rollback(): Promise<void>; }
