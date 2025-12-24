import { cpuProfiler } from './cpuProfiler';
import { memoryProfiler } from './memoryProfiler';
import { networkProfiler } from './networkProfiler';
export interface ProfilerReport { generatedAt: Date; cpu: { profileCount: number }; memory: { snapshotCount: number; leakIndicator: boolean }; network: { requestCount: number; avgDuration: number }; }
export function generateProfilerReport(): ProfilerReport { const leak = memoryProfiler.getLeakIndicators(); const networkStats = networkProfiler.getStats(); return { generatedAt: new Date(), cpu: { profileCount: cpuProfiler.getProfiles().length }, memory: { snapshotCount: memoryProfiler.getSnapshots().length, leakIndicator: leak.growing }, network: { requestCount: networkStats.totalRequests, avgDuration: networkStats.avgDuration } }; }
