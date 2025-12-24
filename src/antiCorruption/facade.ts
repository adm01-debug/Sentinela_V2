import { AntiCorruptionFacade, Translator } from './types';

export class ACLFacade<TExternal, TInternal> implements AntiCorruptionFacade<TInternal> {
  constructor(
    private externalService: TExternal,
    private translator: Translator<TExternal, TInternal>
  ) {}
  
  async execute<R>(operation: (service: TInternal) => Promise<R>): Promise<R> {
    const internalView = this.translator.toInternal(this.externalService as unknown as TExternal);
    return operation(internalView as unknown as TInternal);
  }
  
  getTranslatedService(): TInternal {
    return this.translator.toInternal(this.externalService as unknown as TExternal);
  }
}