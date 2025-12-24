// Response Merger
export class ResponseMerger {
  merge<T extends Record<string, unknown>>(responses: T[], strategy: "first" | "last" | "combine" = "combine"): T {
    if (responses.length === 0) return {} as T;
    switch (strategy) {
      case "first": return responses[0];
      case "last": return responses[responses.length - 1];
      case "combine": return Object.assign({}, ...responses);
    }
  }
  deepMerge<T extends Record<string, unknown>>(target: T, source: T): T {
    const result = { ...target } as T;
    for (const key of Object.keys(source) as (keyof T)[]) {
      if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] as Record<string, unknown> || {}, source[key] as Record<string, unknown>) as T[keyof T];
      } else { result[key] = source[key]; }
    }
    return result;
  }
}
