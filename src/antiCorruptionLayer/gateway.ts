import { ACLFacade } from './facade';
import { TranslationResult, ExternalModel, DomainModel, TranslationContext } from './types';

export class ACLGateway {
  private facades: Map<string, ACLFacade> = new Map();

  register(systemName: string, facade: ACLFacade): void {
    this.facades.set(systemName, facade);
  }

  getFacade(systemName: string): ACLFacade | undefined {
    return this.facades.get(systemName);
  }

  async translate<E extends ExternalModel, D extends DomainModel>(
    systemName: string,
    translatorKey: string,
    direction: 'toDomain' | 'toExternal',
    data: E | D,
    context?: Partial<TranslationContext>
  ): Promise<TranslationResult<E | D>> {
    const facade = this.facades.get(systemName);
    if (!facade) {
      return { success: false, errors: ['System not found: ' + systemName] };
    }

    return direction === 'toDomain'
      ? facade.translateToDomain(translatorKey, data as E, context)
      : facade.translateToExternal(translatorKey, data as D, context);
  }

  listSystems(): string[] {
    return Array.from(this.facades.keys());
  }
}

export class MonitoredGateway extends ACLGateway {
  private metrics: TranslationMetrics[] = [];

  async translate<E extends ExternalModel, D extends DomainModel>(
    systemName: string,
    translatorKey: string,
    direction: 'toDomain' | 'toExternal',
    data: E | D,
    context?: Partial<TranslationContext>
  ): Promise<TranslationResult<E | D>> {
    const start = Date.now();
    const result = await super.translate(systemName, translatorKey, direction, data, context);
    
    this.metrics.push({
      system: systemName,
      translator: translatorKey,
      direction,
      success: result.success,
      duration: Date.now() - start,
      timestamp: new Date()
    });

    return result;
  }

  getMetrics(): TranslationMetrics[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export interface TranslationMetrics {
  system: string;
  translator: string;
  direction: 'toDomain' | 'toExternal';
  success: boolean;
  duration: number;
  timestamp: Date;
}