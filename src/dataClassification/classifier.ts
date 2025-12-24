export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
export interface ClassifiedData { id: string; data: any; level: ClassificationLevel; classifiedAt: Date; classifiedBy: string; expiresAt?: Date; }
export class DataClassifier {
  private classified = new Map<string, ClassifiedData>();
  classify(data: any, level: ClassificationLevel, classifiedBy: string, expiresAt?: Date): ClassifiedData { const entry: ClassifiedData = { id: crypto.randomUUID(), data, level, classifiedAt: new Date(), classifiedBy, expiresAt }; this.classified.set(entry.id, entry); return entry; }
  reclassify(id: string, newLevel: ClassificationLevel, reclassifiedBy: string): void { const entry = this.classified.get(id); if (entry) { entry.level = newLevel; entry.classifiedBy = reclassifiedBy; entry.classifiedAt = new Date(); } }
  get(id: string): ClassifiedData | undefined { return this.classified.get(id); }
  getByLevel(level: ClassificationLevel): ClassifiedData[] { return Array.from(this.classified.values()).filter(c => c.level === level); }
}
export const dataClassifier = new DataClassifier();
