export interface Tag { name: string; commit: string; message: string; createdAt: Date; }
export class TagManager {
  private tags: Tag[] = [];
  create(name: string, commit: string, message: string): Tag { const tag: Tag = { name, commit, message, createdAt: new Date() }; this.tags.push(tag); return tag; }
  get(name: string): Tag | undefined { return this.tags.find(t => t.name === name); }
  getAll(): Tag[] { return [...this.tags]; }
  delete(name: string): boolean { const idx = this.tags.findIndex(t => t.name === name); if (idx >= 0) { this.tags.splice(idx, 1); return true; } return false; }
  getLatest(): Tag | null { return this.tags.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null; }
}
export const tagManager = new TagManager();
