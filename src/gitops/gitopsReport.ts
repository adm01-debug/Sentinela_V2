import { gitSync } from './gitSync';
import { driftDetector } from './driftDetector';
export interface GitOpsReport { generatedAt: Date; syncStatus: string; lastCommit: string; driftCount: number; resources: { synced: number; drifted: number }; }
export function generateGitOpsReport(): GitOpsReport { const status = gitSync.getStatus(); const drifts = driftDetector.getDrifts(); return { generatedAt: new Date(), syncStatus: status.status, lastCommit: status.commit, driftCount: drifts.length, resources: { synced: 0, drifted: drifts.length } }; }
