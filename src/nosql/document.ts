import { Document } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentStore {
  private collections: Map<string, Map<string, Document>> = new Map();
  
  collection(name: string): Collection {
    if (!this.collections.has(name)) this.collections.set(name, new Map());
    return new Collection(this.collections.get(name)!);
  }
  
  dropCollection(name: string): boolean { return this.collections.delete(name); }
  listCollections(): string[] { return Array.from(this.collections.keys()); }
}

export class Collection {
  constructor(private docs: Map<string, Document>) {}
  
  insert(doc: Omit<Document, '_id'>): Document {
    const id = uuidv4();
    const document: Document = { _id: id, ...doc };
    this.docs.set(id, document);
    return document;
  }
  
  findById(id: string): Document | undefined { return this.docs.get(id); }
  
  find(query: Partial<Document>): Document[] {
    return Array.from(this.docs.values()).filter(doc => {
      return Object.entries(query).every(([k, v]) => doc[k] === v);
    });
  }
  
  findOne(query: Partial<Document>): Document | undefined { return this.find(query)[0]; }
  update(id: string, update: Partial<Document>): boolean {
    const doc = this.docs.get(id);
    if (!doc) return false;
    Object.assign(doc, update);
    return true;
  }
  
  delete(id: string): boolean { return this.docs.delete(id); }
  count(): number { return this.docs.size; }
}