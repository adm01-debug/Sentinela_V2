/**
 * @fileoverview ACL Facade
 * @module @sentinela/core/antiCorruptionLayer
 * @version 13.0.0
 */

import { TranslatorRegistry } from './translator';
import { TranslationContext, TranslationResult, ExternalModel, DomainModel } from './types';

export class ACLFacade {
  constructor(
    private registry: TranslatorRegistry,
    private defaultContext?: Partial<TranslationContext>
  ) {}

  async translateToDomain<E extends ExternalModel, D extends DomainModel>(
    translatorKey: string,
    external: E,
    context?: Partial<TranslationContext>
  ): Promise<TranslationResult<D>> {
    const fullContext = this.buildContext(context);
    return this.registry.translate(translatorKey, 'toDomain', external, fullContext) as TranslationResult<D>;
  }

  async translateToExternal<E extends ExternalModel, D extends DomainModel>(
    translatorKey: string,
    domain: D,
    context?: Partial<TranslationContext>
  ): Promise<TranslationResult<E>> {
    const fullContext = this.buildContext(context);
    return this.registry.translate(translatorKey, 'toExternal', domain, fullContext) as TranslationResult<E>;
  }

  private buildContext(override?: Partial<TranslationContext>): TranslationContext {
    return {
      sourceSystem: this.defaultContext?.sourceSystem ?? 'unknown',
      targetSystem: this.defaultContext?.targetSystem ?? 'unknown',
      timestamp: new Date(),
      ...this.defaultContext,
      ...override
    };
  }
}

export class CachingFacade extends ACLFacade {
  private cache: Map<string, { result: TranslationResult<any>; expiry: Date }> = new Map();

  constructor(
    registry: TranslatorRegistry,
    private ttlMs: number = 60000,
    defaultContext?: Partial<TranslationContext>
  ) {
    super(registry, defaultContext);
  }

  async translateToDomain<E extends ExternalModel, D extends DomainModel>(
    translatorKey: string,
    external: E,
    context?: Partial<TranslationContext>
  ): Promise<TranslationResult<D>> {
    const cacheKey = translatorKey + ':' + JSON.stringify(external);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > new Date()) {
      return cached.result;
    }

    const result = await super.translateToDomain<E, D>(translatorKey, external, context);
    this.cache.set(cacheKey, { result, expiry: new Date(Date.now() + this.ttlMs) });
    return result;
  }
}