import { artifactManager } from './artifactManager';
import { artifactStorage } from './artifactStorage';
export interface CleanupPolicy { maxAge: number; maxCount: number; maxSize: number; }
export class ArtifactCleanup {
  private policy: CleanupPolicy = { maxAge: 30 * 24 * 60 * 60 * 1000, maxCount: 100, maxSize: 1024 * 1024 * 1024 };
  setPolicy(policy: Partial<CleanupPolicy>): void { this.policy = { ...this.policy, ...policy }; }
  async run(): Promise<{ deleted: number; freed: number }> { let deleted = 0, freed = 0; const now = Date.now(); const artifacts = artifactManager.list(); for (const artifact of artifacts) { if (now - artifact.createdAt.getTime() > this.policy.maxAge) { await artifactStorage.delete(artifact.id); artifactManager.delete(artifact.id); deleted++; freed += artifact.size; } } return { deleted, freed }; }
}
export const artifactCleanup = new ArtifactCleanup();
