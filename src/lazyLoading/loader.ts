/**
 * @fileoverview Lazy loader implementation
 * @module @sentinela/core/lazyLoading
 * @version 13.0.0
 */

import { LazyLoaderConfig, LazyLoadResult, LazyLoader } from './types';

export class DefaultLazyLoader<T> implements LazyLoader<T> {
  private loaded = false;
  private data: T | null = null;
  private loadedAt = 0;

  constructor(
    private readonly factory: () => Promise<T>,
    private readonly config: LazyLoaderConfig = {}
  ) {}

  async load(): Promise<T> {
    if (this.loaded && this.data !== null) {
      return this.data;
    }
    this.data = await this.factory();
    this.loaded = true;
    this.loadedAt = Date.now();
    return this.data;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  invalidate(): void {
    this.loaded = false;
    this.data = null;
  }

  getResult(): LazyLoadResult<T> | null {
    if (!this.loaded || this.data === null) return null;
    return { data: this.data, loadedAt: this.loadedAt, fromCache: true };
  }
}

export function lazy<T>(factory: () => Promise<T>, config?: LazyLoaderConfig): LazyLoader<T> {
  return new DefaultLazyLoader(factory, config);
}
