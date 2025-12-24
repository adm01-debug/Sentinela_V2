// Service Catalog
export interface CatalogEntry { id: string; name: string; description: string; owner: string; docs: string; tags: string[]; }
export class ServiceCatalog {
  private entries: Map<string, CatalogEntry> = new Map();
  add(entry: CatalogEntry): void { this.entries.set(entry.id, entry); }
  get(id: string): CatalogEntry | undefined { return this.entries.get(id); }
  search(query: string): CatalogEntry[] { const q = query.toLowerCase(); return Array.from(this.entries.values()).filter(e => e.name.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q))); }
  byOwner(owner: string): CatalogEntry[] { return Array.from(this.entries.values()).filter(e => e.owner === owner); }
  all(): CatalogEntry[] { return Array.from(this.entries.values()); }
}
