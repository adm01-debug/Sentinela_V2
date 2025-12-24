export interface Feature { name: string; value: number; type: 'numeric' | 'categorical' | 'boolean'; }
export class FeatureExtractor {
  extract(data: Record<string, any>, schema: { name: string; type: Feature['type'] }[]): Feature[] { return schema.map(s => ({ name: s.name, value: this.extractValue(data[s.name], s.type), type: s.type })); }
  private extractValue(value: any, type: Feature['type']): number { switch (type) { case 'numeric': return Number(value) || 0; case 'boolean': return value ? 1 : 0; case 'categorical': return this.hashString(String(value)); default: return 0; } }
  private hashString(str: string): number { let hash = 0; for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; } return Math.abs(hash) % 1000; }
  normalize(features: Feature[]): Feature[] { const max = Math.max(...features.map(f => f.value)); return features.map(f => ({ ...f, value: f.value / max })); }
}
export const featureExtractor = new FeatureExtractor();
