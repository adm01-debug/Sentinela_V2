import { ModelVersion, ModelStage } from './types';

export class ModelVersioning {
  static parseVersion(version: string): { major: number; minor: number; patch: number } {
    const [major, minor, patch] = version.split('.').map(Number);
    return { major: major ?? 0, minor: minor ?? 0, patch: patch ?? 0 };
  }
  
  static incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const v = this.parseVersion(version);
    switch (type) {
      case 'major': return (v.major + 1) + '.0.0';
      case 'minor': return v.major + '.' + (v.minor + 1) + '.0';
      case 'patch': return v.major + '.' + v.minor + '.' + (v.patch + 1);
    }
  }
  
  static compare(a: string, b: string): number {
    const va = this.parseVersion(a);
    const vb = this.parseVersion(b);
    if (va.major !== vb.major) return va.major - vb.major;
    if (va.minor !== vb.minor) return va.minor - vb.minor;
    return va.patch - vb.patch;
  }
}

export class VersionHistory {
  private history: ModelVersion[] = [];
  
  add(version: ModelVersion): void { this.history.push(version); }
  getLatest(): ModelVersion | undefined { return this.history[this.history.length - 1]; }
  getByStage(stage: ModelStage): ModelVersion[] { return this.history.filter(v => v.stage === stage); }
}