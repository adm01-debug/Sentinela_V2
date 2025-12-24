import { TranslationResult, ExternalModel, DomainModel, TranslationContext } from './types';

export abstract class Translator<TExternal extends ExternalModel, TDomain extends DomainModel> {
  abstract toDomain(external: TExternal, context?: TranslationContext): TranslationResult<TDomain>;
  abstract toExternal(domain: TDomain, context?: TranslationContext): TranslationResult<TExternal>;

  protected success<T>(data: T): TranslationResult<T> {
    return { success: true, data };
  }

  protected failure<T>(errors: string[]): TranslationResult<T> {
    return { success: false, errors };
  }

  protected withWarnings<T>(data: T, warnings: string[]): TranslationResult<T> {
    return { success: true, data, warnings };
  }
}

export class TranslatorRegistry {
  private translators: Map<string, Translator<any, any>> = new Map();

  register<E extends ExternalModel, D extends DomainModel>(
    key: string,
    translator: Translator<E, D>
  ): void {
    this.translators.set(key, translator);
  }

  get<E extends ExternalModel, D extends DomainModel>(key: string): Translator<E, D> | undefined {
    return this.translators.get(key);
  }

  translate<E extends ExternalModel, D extends DomainModel>(
    key: string,
    direction: 'toDomain' | 'toExternal',
    data: E | D,
    context?: TranslationContext
  ): TranslationResult<E | D> {
    const translator = this.translators.get(key);
    if (!translator) {
      return { success: false, errors: ['Translator not found: ' + key] };
    }
    return direction === 'toDomain'
      ? translator.toDomain(data as E, context)
      : translator.toExternal(data as D, context);
  }
}

export class CompositeTranslator<E extends ExternalModel, D extends DomainModel> extends Translator<E, D> {
  private translators: Translator<any, any>[] = [];

  add(translator: Translator<any, any>): void {
    this.translators.push(translator);
  }

  toDomain(external: E, context?: TranslationContext): TranslationResult<D> {
    let current: any = external;
    const allWarnings: string[] = [];

    for (const translator of this.translators) {
      const result = translator.toDomain(current, context);
      if (!result.success) return result;
      if (result.warnings) allWarnings.push(...result.warnings);
      current = result.data;
    }

    return this.withWarnings(current, allWarnings);
  }

  toExternal(domain: D, context?: TranslationContext): TranslationResult<E> {
    let current: any = domain;
    const allWarnings: string[] = [];

    for (const translator of [...this.translators].reverse()) {
      const result = translator.toExternal(current, context);
      if (!result.success) return result;
      if (result.warnings) allWarnings.push(...result.warnings);
      current = result.data;
    }

    return this.withWarnings(current, allWarnings);
  }
}