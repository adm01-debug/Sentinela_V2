const cacheStore = new Map<string, { value: any; expiry: number }>();

export function Cache(ttlSeconds = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = cacheStore.get(key);

      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }

      const result = await originalMethod.apply(this, args);
      cacheStore.set(key, { value: result, expiry: Date.now() + ttlSeconds * 1000 });
      return result;
    };

    return descriptor;
  };
}

export function ClearCache(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const result = await originalMethod.apply(this, args);
    cacheStore.clear();
    return result;
  };

  return descriptor;
}
