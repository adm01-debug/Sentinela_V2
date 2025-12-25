/**
 * @fileoverview Lazy loading types
 * @module @sentinela/core/lazyLoading
 * @version 13.0.0
 */

export interface LazyLoaderConfig {
  threshold?: number;
  rootMargin?: string;
  preload?: boolean;
}

export interface LazyLoadResult<T> {
  data: T;
  loadedAt: number;
  fromCache: boolean;
}

export interface LazyLoader<T> {
  load(): Promise<T>;
  isLoaded(): boolean;
  invalidate(): void;
}
