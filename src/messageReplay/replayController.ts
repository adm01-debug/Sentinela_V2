import { ReplayConfig, ReplayProgress } from './types';
import { ReplayEngine } from './replayEngine';
import { ReplayStore } from './replayStore';

export class ReplayController {
  private replays: Map<string, ReplayEngine> = new Map();
  
  constructor(private store: ReplayStore) {}
  
  createReplay(id: string, config: ReplayConfig): ReplayEngine {
    const engine = new ReplayEngine(this.store, config);
    this.replays.set(id, engine);
    return engine;
  }
  
  getReplay(id: string): ReplayEngine | undefined { return this.replays.get(id); }
  
  async startReplay(id: string): Promise<void> {
    const engine = this.replays.get(id);
    if (engine) await engine.start();
  }
  
  pauseReplay(id: string): void { this.replays.get(id)?.pause(); }
  resumeReplay(id: string): void { this.replays.get(id)?.resume(); }
  stopReplay(id: string): void { this.replays.get(id)?.stop(); }
  
  getProgress(id: string): ReplayProgress | undefined { return this.replays.get(id)?.getProgress(); }
  getAllReplays(): string[] { return Array.from(this.replays.keys()); }
}