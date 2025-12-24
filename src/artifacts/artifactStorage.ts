export interface StorageConfig { type: 'local' | 's3' | 'gcs'; path: string; maxSize?: number; }
export class ArtifactStorage {
  private config: StorageConfig = { type: 'local', path: './artifacts' };
  configure(config: StorageConfig): void { this.config = config; }
  async save(id: string, data: Uint8Array): Promise<string> { const path = this.config.path + '/' + id; console.log('Saving artifact to ' + path); return path; }
  async load(id: string): Promise<Uint8Array | null> { console.log('Loading artifact ' + id); return null; }
  async delete(id: string): Promise<void> { console.log('Deleting artifact ' + id); }
  async getSize(): Promise<number> { return 0; }
}
export const artifactStorage = new ArtifactStorage();
