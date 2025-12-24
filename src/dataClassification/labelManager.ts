import { ClassificationLevel } from './classifier';
export interface DataLabel { id: string; resourceId: string; resourceType: string; level: ClassificationLevel; tags: string[]; appliedAt: Date; appliedBy: string; }
export class LabelManager {
  private labels = new Map<string, DataLabel>();
  apply(resourceId: string, resourceType: string, level: ClassificationLevel, tags: string[], appliedBy: string): DataLabel { const label: DataLabel = { id: crypto.randomUUID(), resourceId, resourceType, level, tags, appliedAt: new Date(), appliedBy }; this.labels.set(label.id, label); return label; }
  getByResource(resourceId: string): DataLabel | undefined { return Array.from(this.labels.values()).find(l => l.resourceId === resourceId); }
  getByLevel(level: ClassificationLevel): DataLabel[] { return Array.from(this.labels.values()).filter(l => l.level === level); }
  getByTag(tag: string): DataLabel[] { return Array.from(this.labels.values()).filter(l => l.tags.includes(tag)); }
  remove(resourceId: string): boolean { const label = this.getByResource(resourceId); if (label) { this.labels.delete(label.id); return true; } return false; }
}
export const labelManager = new LabelManager();
