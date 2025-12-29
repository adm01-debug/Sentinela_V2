/**
 * @fileoverview External system adapter
 * @module @sentinela/core/antiCorruptionLayer
 * @version 13.0.0
 */

import { ExternalModel, DomainModel, TranslationResult } from './types';
import { Translator } from './translator';

export abstract class ExternalSystemAdapter<TExternal extends ExternalModel, TDomain extends DomainModel> {
  constructor(protected translator: Translator<TExternal, TDomain>) {}

  abstract fetch(id: string): Promise<TExternal>;
  abstract save(external: TExternal): Promise<void>;

  async fetchAsDomain(id: string): Promise<TranslationResult<TDomain>> {
    const external = await this.fetch(id);
    return this.translator.toDomain(external);
  }

  async saveFromDomain(domain: TDomain): Promise<TranslationResult<void>> {
    const result = this.translator.toExternal(domain);
    if (!result.success || !result.data) {
      return { success: false, errors: result.errors };
    }
    await this.save(result.data);
    return { success: true };
  }
}

export class HTTPAdapter<TExternal extends ExternalModel, TDomain extends DomainModel> 
  extends ExternalSystemAdapter<TExternal, TDomain> {
  
  constructor(
    translator: Translator<TExternal, TDomain>,
    private baseUrl: string,
    private headers: Record<string, string> = {}
  ) {
    super(translator);
  }

  async fetch(id: string): Promise<TExternal> {
    if (import.meta.env.DEV) console.log('Fetching from', this.baseUrl + '/' + id);
    return {} as TExternal;
  }

  async save(external: TExternal): Promise<void> {
    if (import.meta.env.DEV) console.log('Saving to', this.baseUrl);
  }
}

export class DatabaseAdapter<TExternal extends ExternalModel, TDomain extends DomainModel>
  extends ExternalSystemAdapter<TExternal, TDomain> {

  constructor(
    translator: Translator<TExternal, TDomain>,
    private tableName: string
  ) {
    super(translator);
  }

  async fetch(id: string): Promise<TExternal> {
    if (import.meta.env.DEV) console.log('Fetching from table', this.tableName, 'id:', id);
    return {} as TExternal;
  }

  async save(external: TExternal): Promise<void> {
    if (import.meta.env.DEV) console.log('Saving to table', this.tableName);
  }
}