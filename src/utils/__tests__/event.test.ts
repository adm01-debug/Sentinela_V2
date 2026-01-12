import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('event utils', () => {
  describe('EventEmitter', () => {
    class EventEmitter {
      private events: Map<string, Function[]> = new Map();

      on(event: string, listener: Function) {
        if (!this.events.has(event)) {
          this.events.set(event, []);
        }
        this.events.get(event)!.push(listener);
        return () => this.off(event, listener);
      }

      off(event: string, listener: Function) {
        const listeners = this.events.get(event);
        if (listeners) {
          const index = listeners.indexOf(listener);
          if (index > -1) listeners.splice(index, 1);
        }
      }

      emit(event: string, ...args: any[]) {
        const listeners = this.events.get(event);
        if (listeners) {
          listeners.forEach(listener => listener(...args));
        }
      }

      once(event: string, listener: Function) {
        const wrapper = (...args: any[]) => {
          listener(...args);
          this.off(event, wrapper);
        };
        return this.on(event, wrapper);
      }
    }

    let emitter: EventEmitter;

    beforeEach(() => {
      emitter = new EventEmitter();
    });

    it('should add event listener', () => {
      const listener = vi.fn();
      emitter.on('test', listener);
      emitter.emit('test');
      expect(listener).toHaveBeenCalled();
    });

    it('should remove event listener', () => {
      const listener = vi.fn();
      emitter.on('test', listener);
      emitter.off('test', listener);
      emitter.emit('test');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should pass arguments to listener', () => {
      const listener = vi.fn();
      emitter.on('data', listener);
      emitter.emit('data', 'arg1', 'arg2');
      expect(listener).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should handle multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.emit('test');
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle once listener', () => {
      const listener = vi.fn();
      emitter.once('test', listener);
      emitter.emit('test');
      emitter.emit('test');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = emitter.on('test', listener);
      unsubscribe();
      emitter.emit('test');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('DOM Events', () => {
    it('should create custom event', () => {
      const event = new CustomEvent('custom', { detail: { value: 42 } });
      expect(event.type).toBe('custom');
      expect(event.detail.value).toBe(42);
    });

    it('should dispatch event on element', () => {
      const element = document.createElement('div');
      const handler = vi.fn();
      element.addEventListener('click', handler);
      element.dispatchEvent(new Event('click'));
      expect(handler).toHaveBeenCalled();
    });

    it('should stop propagation', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      
      const parentHandler = vi.fn();
      const childHandler = vi.fn((e: Event) => e.stopPropagation());
      
      parent.addEventListener('click', parentHandler);
      child.addEventListener('click', childHandler);
      
      child.dispatchEvent(new Event('click', { bubbles: true }));
      expect(childHandler).toHaveBeenCalled();
    });

    it('should prevent default', () => {
      const form = document.createElement('form');
      const handler = vi.fn((e: Event) => {
        e.preventDefault();
        return false;
      });
      form.addEventListener('submit', handler);
      const event = new Event('submit', { cancelable: true });
      form.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Event delegation', () => {
    it('should delegate events to parent', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      button.className = 'btn';
      container.appendChild(button);
      
      const handler = vi.fn();
      container.addEventListener('click', (e) => {
        if ((e.target as Element).matches('.btn')) {
          handler();
        }
      });
      
      button.click();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Keyboard events', () => {
    it('should create keyboard event', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(event.key).toBe('Enter');
    });

    it('should detect modifier keys', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true 
      });
      expect(event.ctrlKey).toBe(true);
    });
  });
});
