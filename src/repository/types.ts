export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}

export interface QueryRepository<T> {
  findBy(criteria: QueryCriteria<T>): Promise<T[]>;
  findOne(criteria: QueryCriteria<T>): Promise<T | null>;
  count(criteria?: QueryCriteria<T>): Promise<number>;
}

export interface QueryCriteria<T> {
  where?: Partial<T>;
  orderBy?: { field: keyof T; direction: 'asc' | 'desc' }[];
  skip?: number;
  take?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}