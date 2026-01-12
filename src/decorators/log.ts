export function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`[${new Date().toISOString()}] Calling ${propertyKey} with:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`[${new Date().toISOString()}] ${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

export function LogAsync(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    console.log(`[${new Date().toISOString()}] Calling async ${propertyKey}`);
    const start = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      console.log(`[${new Date().toISOString()}] ${propertyKey} completed in ${Date.now() - start}ms`);
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${propertyKey} failed:`, error);
      throw error;
    }
  };

  return descriptor;
}
