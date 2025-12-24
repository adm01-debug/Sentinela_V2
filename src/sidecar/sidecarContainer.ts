import { SidecarContainer } from './types';

export class SidecarManager {
  private sidecars: Map<string, SidecarInstance> = new Map();
  
  deploy(config: SidecarContainer): SidecarInstance {
    const instance = new SidecarInstance(config);
    this.sidecars.set(config.name, instance);
    instance.start();
    return instance;
  }
  
  stop(name: string): void { this.sidecars.get(name)?.stop(); this.sidecars.delete(name); }
  stopAll(): void { this.sidecars.forEach(s => s.stop()); this.sidecars.clear(); }
  get(name: string): SidecarInstance | undefined { return this.sidecars.get(name); }
}

export class SidecarInstance {
  private running: boolean = false;
  constructor(private config: SidecarContainer) {}
  
  start(): void { this.running = true; console.log('Sidecar', this.config.name, 'started'); }
  stop(): void { this.running = false; console.log('Sidecar', this.config.name, 'stopped'); }
  isRunning(): boolean { return this.running; }
  getConfig(): SidecarContainer { return this.config; }
}