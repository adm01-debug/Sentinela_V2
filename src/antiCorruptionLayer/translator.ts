/**
 * @fileoverview Anti-Corruption Layer implementation
 * @module @sentinela/core/antiCorruptionLayer
 * @version 13.0.0
 */

export interface Translator<TExternal, TInternal> {
  toInternal(external: TExternal): TInternal;
  toExternal(internal: TInternal): TExternal;
}

export abstract class ACLFacade<TExternalService> {
  constructor(protected readonly externalService: TExternalService) {}
}

export abstract class ACLAdapter<TExternal, TInternal> {
  constructor(protected readonly translator: Translator<TExternal, TInternal>) {}

  adapt(external: TExternal): TInternal {
    return this.translator.toInternal(external);
  }

  adaptBack(internal: TInternal): TExternal {
    return this.translator.toExternal(internal);
  }
}

export class ACLGateway<TRequest, TResponse, TExternalRequest, TExternalResponse> {
  constructor(
    private readonly requestTranslator: Translator<TRequest, TExternalRequest>,
    private readonly responseTranslator: Translator<TExternalResponse, TResponse>,
    private readonly externalCall: (req: TExternalRequest) => Promise<TExternalResponse>
  ) {}

  async execute(request: TRequest): Promise<TResponse> {
    const externalRequest = this.requestTranslator.toExternal(request);
    const externalResponse = await this.externalCall(externalRequest);
    return this.responseTranslator.toInternal(externalResponse);
  }
}

export function createTranslator<TExternal, TInternal>(
  toInternal: (external: TExternal) => TInternal,
  toExternal: (internal: TInternal) => TExternal
): Translator<TExternal, TInternal> {
  return { toInternal, toExternal };
}
