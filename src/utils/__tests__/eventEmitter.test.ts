import { describe, it, expect, vi } from 'vitest';
import { EventEmitter, eventBus } from '../eventEmitter';

describe('EventEmitter', () => {
  it('should emit and receive events', () => {
    const emitter = new EventEmitter();
    const callback = vi.fn();
    emitter.on('test', callback);
    emitter.emit('test', 'data');
    expect(callback).toHaveBeenCalledWith('data');
  });

  it('should remove listener', () => {
    const emitter = new EventEmitter();
    const callback = vi.fn();
    const off = emitter.on('test', callback);
    off();
    emitter.emit('test', 'data');
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle once', () => {
    const emitter = new EventEmitter();
    const callback = vi.fn();
    emitter.once('test', callback);
    emitter.emit('test', 1);
    emitter.emit('test', 2);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should export global eventBus', () => {
    expect(eventBus).toBeDefined();
    expect(typeof eventBus.emit).toBe('function');
  });
});
