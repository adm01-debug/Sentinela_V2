type Interceptor<T> = (value: T) => T | Promise<T>;
class InterceptorManager<T> {
  private handlers: Array<{ fulfilled: Interceptor<T>; rejected?: Interceptor<any> }> = [];
  use(fulfilled: Interceptor<T>, rejected?: Interceptor<any>) {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }
  eject(id: number) { this.handlers.splice(id, 1); }
  async run(value: T): Promise<T> {
    for (const handler of this.handlers) {
      try { value = await handler.fulfilled(value); }
      catch (error) { if (handler.rejected) value = await handler.rejected(error); else throw error; }
    }
    return value;
  }
}
export const requestInterceptors = new InterceptorManager<RequestInit>();
export const responseInterceptors = new InterceptorManager<Response>();
