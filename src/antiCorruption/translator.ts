import { Translator } from './types';

export abstract class BaseTranslator<TExternal, TInternal> implements Translator<TExternal, TInternal> {
  abstract toInternal(external: TExternal): TInternal;
  abstract toExternal(internal: TInternal): TExternal;
  
  translateList(externals: TExternal[]): TInternal[] { return externals.map(e => this.toInternal(e)); }
  translateListBack(internals: TInternal[]): TExternal[] { return internals.map(i => this.toExternal(i)); }
}

export class CompositeTranslator<A, B, C> implements Translator<A, C> {
  constructor(private first: Translator<A, B>, private second: Translator<B, C>) {}
  toInternal(external: A): C { return this.second.toInternal(this.first.toInternal(external)); }
  toExternal(internal: C): A { return this.first.toExternal(this.second.toExternal(internal)); }
}