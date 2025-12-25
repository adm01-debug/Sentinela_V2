export interface Translator<I, E> { toInternal(external: E): I; toExternal(internal: I): E; }
