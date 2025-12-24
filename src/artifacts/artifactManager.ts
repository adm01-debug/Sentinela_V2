export interface Artifact { id: string; name: string; version: string; type: string; size: number; checksum: string; createdAt: Date; metadata?: Record<string, any>; }
export class ArtifactManager {
  private artifacts = new Map<string, Artifact>();
  add(artifact: Artifact): void { this.artifacts.set(artifact.id, artifact); }
  get(id: string): Artifact | undefined { return this.artifacts.get(id); }
  getByName(name: string): Artifact[] { return Array.from(this.artifacts.values()).filter(a => a.name === name); }
  getLatest(name: string): Artifact | null { return this.getByName(name).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null; }
  delete(id: string): boolean { return this.artifacts.delete(id); }
  list(): Artifact[] { return Array.from(this.artifacts.values()); }
}
export const artifactManager = new ArtifactManager();
