import { ConfigMap, Secret, VolumeProjection, KeyToPath } from './types';
import { ConfigMapManager } from './configMap';
import { SecretManager } from './secret';

export class VolumeProjector {
  constructor(private configMaps: ConfigMapManager, private secrets: SecretManager) {}
  
  project(namespace: string, projections: VolumeProjection[]): ProjectedVolume {
    const files: ProjectedFile[] = [];
    
    for (const projection of projections) {
      if (projection.configMap) {
        const cm = this.configMaps.get(namespace, projection.configMap.name);
        if (cm) files.push(...this.projectData(cm.data, projection.configMap.items));
      }
      if (projection.secret) {
        const secret = this.secrets.get(namespace, projection.secret.name);
        if (secret) files.push(...this.projectData(secret.data, projection.secret.items));
      }
    }
    
    return { files };
  }
  
  private projectData(data: Record<string, string>, items?: KeyToPath[]): ProjectedFile[] {
    if (items) {
      return items.map(item => ({ path: item.path, content: data[item.key] ?? '', mode: item.mode ?? 0o644 }));
    }
    return Object.entries(data).map(([key, value]) => ({ path: key, content: value, mode: 0o644 }));
  }
}

export interface ProjectedVolume { files: ProjectedFile[]; }
export interface ProjectedFile { path: string; content: string; mode: number; }