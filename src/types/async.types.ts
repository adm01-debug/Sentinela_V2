export type AsyncState<T> = { data: T | null; loading: boolean; error: Error | null };
export type AsyncAction<T> =
  | { type: "loading" }
  | { type: "success"; data: T }
  | { type: "error"; error: Error };
export type PromiseValue<T> = T extends Promise<infer V> ? V : T;
