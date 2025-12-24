import { Document, QueryOptions, IndexDefinition } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentStore {
  private collections: Map<string, Map<string, Document>> = new Map();
  private indexes: Map<string, IndexDefinition[]> = new Map();
  
  collection(name: string): Collection { return new Collection(name, this.getOrCreateCollection(name)); }
  
  private getOrCreateCollection(name: string): Map<string, Document> {
    if (!this.collections.has(name)) this.collections.set(name, new Map());
    return this.collections.get(name)!;
  }
  
  createIndex(collection: string, index: IndexDefinition): void {
    const indexes = this.indexes.get(collection) ?? [];
    indexes.push(index);
    this.indexes.set(collection, indexes);
  }
  
  dropCollection(name: string): void { this.collections.delete(name); }
  listCollections(): string[] { return Array.from(this.collections.keys()); }
}

export class Collection {
  constructor(private name: string, private data: Map<string, Document>) {}
  
  async insert(doc: Omit<Document, '_id'>): Promise<Document> {
    const id = uuidv4();
    const document: Document = { _id: id, ...doc };
    this.data.set(id, document);
    return document;
  }
  
  async insertMany(docs: Omit<Document, '_id'>[]): Promise<Document[]> { return Promise.all(docs.map(d => this.insert(d))); }
  
  async findById(id: string): Promise<Document | null> { return this.data.get(id) ?? null; }
  
  async find(options?: QueryOptions): Promise<Document[]> {
    let results = Array.from(this.data.values());
    if (options?.filter) results = results.filter(doc => this.matchFilter(doc, options.filter!));
    if (options?.sort) results = this.sortDocuments(results, options.sort);
    if (options?.skip) results = results.slice(options.skip);
    if (options?.limit) results = results.slice(0, options.limit);
    if (options?.projection) results = results.map(doc => this.project(doc, options.projection!));
    return results;
  }
  
  async findOne(filter: Record<string, unknown>): Promise<Document | null> {
    const results = await this.find({ filter, limit: 1 });
    return results[0] ?? null;
  }
  
  async update(id: string, update: Partial<Document>): Promise<Document | null> {
    const doc = this.data.get(id);
    if (!doc) return null;
    const updated = { ...doc, ...update, _id: id };
    this.data.set(id, updated);
    return updated;
  }
  
  async delete(id: string): Promise<boolean> { return this.data.delete(id); }
  async count(filter?: Record<string, unknown>): Promise<number> { return (await this.find({ filter })).length; }
  
  private matchFilter(doc: Document, filter: Record<string, unknown>): boolean {
    return Object.entries(filter).every(([key, value]) => doc[key] === value);
  }
  
  private sortDocuments(docs: Document[], sort: Record<string, 1 | -1>): Document[] {
    return [...docs].sort((a, b) => {
      for (const [key, dir] of Object.entries(sort)) {
        if (a[key] < b[key]) return -dir;
        if (a[key] > b[key]) return dir;
      }
      return 0;
    });
  }
  
  private project(doc: Document, fields: string[]): Document {
    const projected: Document = { _id: doc._id };
    fields.forEach(f => { if (f in doc) projected[f] = doc[f]; });
    return projected;
  }
}