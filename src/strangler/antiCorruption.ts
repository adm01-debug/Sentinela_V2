// Anti-Corruption Layer
export interface DataTransformer<TLegacy, TModern> {
  toModern(legacy: TLegacy): TModern;
  toLegacy(modern: TModern): TLegacy;
}

export class AntiCorruptionLayer<TLegacy, TModern> {
  constructor(private transformer: DataTransformer<TLegacy, TModern>) {}

  translateToModern(data: TLegacy): TModern {
    return this.transformer.toModern(data);
  }

  translateToLegacy(data: TModern): TLegacy {
    return this.transformer.toLegacy(data);
  }

  async callLegacy<R>(
    fn: (data: TLegacy) => Promise<R>,
    modernData: TModern
  ): Promise<R> {
    const legacyData = this.translateToLegacy(modernData);
    return fn(legacyData);
  }

  async callModern<R>(
    fn: (data: TModern) => Promise<R>,
    legacyData: TLegacy
  ): Promise<R> {
    const modernData = this.translateToModern(legacyData);
    return fn(modernData);
  }
}

// Example transformer
export const createTransformer = <TLegacy, TModern>(
  toModern: (legacy: TLegacy) => TModern,
  toLegacy: (modern: TModern) => TLegacy
): DataTransformer<TLegacy, TModern> => ({ toModern, toLegacy });
