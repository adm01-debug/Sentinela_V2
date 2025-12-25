/**
 * @jest-environment node
 */
import { DisposableManager, BaseManagedResource } from '../../src/core/disposable';

describe('DisposableManager', () => {
  it('should register and dispose resources', async () => {
    const manager = new DisposableManager();
    const disposed: string[] = [];
    
    manager.register('a', { dispose: async () => { disposed.push('a'); } });
    manager.register('b', { dispose: async () => { disposed.push('b'); } });
    
    await manager.disposeAll();
    
    expect(disposed).toContain('a');
    expect(disposed).toContain('b');
  });

  it('should dispose in priority order', async () => {
    const manager = new DisposableManager();
    const disposed: string[] = [];
    
    manager.register('low', { dispose: async () => { disposed.push('low'); } }, 1);
    manager.register('high', { dispose: async () => { disposed.push('high'); } }, 10);
    
    await manager.disposeAll();
    
    expect(disposed[0]).toBe('high');
    expect(disposed[1]).toBe('low');
  });

  it('should not register after disposed', async () => {
    const manager = new DisposableManager();
    await manager.disposeAll();
    
    expect(() => manager.register('test', { dispose: async () => {} }))
      .toThrow('Manager is already disposed');
  });

  it('should handle dispose errors gracefully', async () => {
    const manager = new DisposableManager();
    
    manager.register('failing', { dispose: async () => { throw new Error('fail'); } });
    manager.register('success', { dispose: async () => {} });
    
    await expect(manager.disposeAll()).resolves.toBeUndefined();
  });
});

describe('BaseManagedResource', () => {
  class TestResource extends BaseManagedResource {
    public initCalled = false;
    public disposeCalled = false;

    protected async doInitialize(): Promise<void> {
      this.initCalled = true;
    }

    protected async doDispose(): Promise<void> {
      this.disposeCalled = true;
    }
  }

  it('should initialize', async () => {
    const resource = new TestResource();
    await resource.initialize();
    
    expect(resource.isInitialized).toBe(true);
    expect(resource.initCalled).toBe(true);
  });

  it('should dispose', async () => {
    const resource = new TestResource();
    await resource.initialize();
    await resource.dispose();
    
    expect(resource.isDisposed).toBe(true);
    expect(resource.disposeCalled).toBe(true);
  });

  it('should not initialize twice', async () => {
    const resource = new TestResource();
    await resource.initialize();
    await resource.initialize();
    
    expect(resource.initCalled).toBe(true);
  });

  it('should not initialize after disposed', async () => {
    const resource = new TestResource();
    await resource.dispose();
    
    await expect(resource.initialize()).rejects.toThrow('Resource is disposed');
  });
});
