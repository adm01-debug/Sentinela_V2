import { 
  DisposableContainer, 
  disposeAll, 
  using, 
  GracefulShutdown,
  isDisposable 
} from '../../core/disposable';

describe('DisposableContainer', () => {
  it('should dispose all resources', async () => {
    const container = new DisposableContainer();
    const dispose1 = jest.fn();
    const dispose2 = jest.fn();
    
    container.add({ dispose: dispose1 });
    container.add({ dispose: dispose2 });
    
    await container.dispose();
    
    expect(dispose1).toHaveBeenCalled();
    expect(dispose2).toHaveBeenCalled();
  });

  it('should dispose in reverse order', async () => {
    const order: number[] = [];
    const container = new DisposableContainer();
    
    container.add({ dispose: () => order.push(1) });
    container.add({ dispose: () => order.push(2) });
    
    await container.dispose();
    
    expect(order).toEqual([2, 1]);
  });
});

describe('disposeAll', () => {
  it('should dispose all resources', async () => {
    const d1 = { dispose: jest.fn() };
    const d2 = { dispose: jest.fn() };
    
    await disposeAll(d1, undefined, d2);
    
    expect(d1.dispose).toHaveBeenCalled();
    expect(d2.dispose).toHaveBeenCalled();
  });
});

describe('using', () => {
  it('should dispose after use', async () => {
    const dispose = jest.fn();
    const resource = { dispose, value: 42 };
    
    const result = await using(resource, async (r) => r.value * 2);
    
    expect(result).toBe(84);
    expect(dispose).toHaveBeenCalled();
  });

  it('should dispose on error', async () => {
    const dispose = jest.fn();
    const resource = { dispose };
    
    await expect(
      using(resource, async () => { throw new Error('fail'); })
    ).rejects.toThrow();
    
    expect(dispose).toHaveBeenCalled();
  });
});

describe('isDisposable', () => {
  it('should detect disposable objects', () => {
    expect(isDisposable({ dispose: () => {} })).toBe(true);
    expect(isDisposable({ close: () => {} })).toBe(false);
    expect(isDisposable(null)).toBe(false);
  });
});
