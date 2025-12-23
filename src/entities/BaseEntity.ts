export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  constructor(id: string, createdAt: Date = new Date()) { this.id = id; this.createdAt = createdAt; }
  equals(other: BaseEntity): boolean { return this.id === other.id; }
}
