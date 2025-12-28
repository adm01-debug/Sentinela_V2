import type { ClassificationLevel } from './classifier';

export interface ClassificationReport {
  generatedAt: Date;
  totalClassified: number;
  byLevel: Record<ClassificationLevel, number>;
  expiringSoon: number;
  recentlyClassified: number;
}

export function generateClassificationReport(): ClassificationReport {
  const now = new Date();

  const byLevel: Record<ClassificationLevel, number> = {
    public: 0,
    internal: 0,
    confidential: 0,
    restricted: 0,
    top_secret: 0,
  };

  return {
    generatedAt: now,
    totalClassified: 0,
    byLevel,
    expiringSoon: 0,
    recentlyClassified: 0,
  };
}
