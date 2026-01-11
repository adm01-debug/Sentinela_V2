// Event utilities for Sentinela v17

type EventHandler<T = Event> = (event: T) => void;

export function on<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  handler: EventHandler<WindowEventMap[K]>,
  options?: AddEventListenerOptions
): () => void;
export function on<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  handler: EventHandler<DocumentEventMap[K]>,
  options?: AddEventListenerOptions
): () => void;
export function on<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  handler: EventHandler<HTMLElementEventMap[K]>,
  options?: AddEventListenerOptions
): () => void;
export function on(
  target: EventTarget,
  type: string,
  handler: EventHandler,
  options?: AddEventListenerOptions
): () => void {
  target.addEventListener(type, handler as EventListener, options);
  return () => target.removeEventListener(type, handler as EventListener, options);
}

export function off(target: EventTarget, type: string, handler: EventHandler): void {
  target.removeEventListener(type, handler as EventListener);
}

export function once<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  handler: EventHandler<HTMLElementEventMap[K]>
): () => void {
  return on(target, type, handler, { once: true });
}

export function delegate<T extends Event>(
  container: HTMLElement,
  selector: string,
  type: string,
  handler: (event: T, target: HTMLElement) => void
): () => void {
  const delegatedHandler = (event: Event) => {
    const target = (event.target as HTMLElement).closest(selector);
    if (target && container.contains(target)) {
      handler(event as T, target as HTMLElement);
    }
  };
  container.addEventListener(type, delegatedHandler);
  return () => container.removeEventListener(type, delegatedHandler);
}

export function emit(target: EventTarget, type: string, detail?: unknown): boolean {
  const event = new CustomEvent(type, { detail, bubbles: true, cancelable: true });
  return target.dispatchEvent(event);
}

export function preventDefault(event: Event): void {
  event.preventDefault();
}

export function stopPropagation(event: Event): void {
  event.stopPropagation();
}

export function stopImmediatePropagation(event: Event): void {
  event.stopImmediatePropagation();
}

export class EventEmitter<T extends Record<string, unknown[]> = Record<string, unknown[]>> {
  private listeners = new Map<keyof T, Set<(...args: unknown[]) => void>>();

  on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void);
    return () => this.off(event, handler);
  }

  off<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this.listeners.get(event)?.forEach((handler) => handler(...args));
  }

  once<K extends keyof T>(event: K, handler: (...args: T[K]) => void): () => void {
    const wrapper = (...args: T[K]) => {
      this.off(event, wrapper);
      handler(...args);
    };
    return this.on(event, wrapper);
  }

  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: keyof T): number {
    return this.listeners.get(event)?.size || 0;
  }
}

export function waitForEvent<T extends Event>(
  target: EventTarget,
  type: string,
  timeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const handler = (event: Event) => {
      target.removeEventListener(type, handler);
      resolve(event as T);
    };
    target.addEventListener(type, handler);
    if (timeout) {
      setTimeout(() => {
        target.removeEventListener(type, handler);
        reject(new Error(`Timeout waiting for ${type}`));
      }, timeout);
    }
  });
}

export function throttleEvent<T extends Event>(
  handler: EventHandler<T>,
  limit: number
): EventHandler<T> {
  let lastCall = 0;
  return (event: T) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      handler(event);
    }
  };
}

export function debounceEvent<T extends Event>(
  handler: EventHandler<T>,
  delay: number
): EventHandler<T> {
  let timeoutId: NodeJS.Timeout;
  return (event: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => handler(event), delay);
  };
}
