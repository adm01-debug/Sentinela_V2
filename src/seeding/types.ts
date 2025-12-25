/**
 * @fileoverview Database seeding types
 * @module @sentinela/core/seeding
 * @version 13.0.0
 */

export interface Seeder { name: string; run: () => Promise<void>; }
export interface Factory<T> { create(overrides?: Partial<T>): T; createMany(count: number, overrides?: Partial<T>): T[]; }
export interface SeederConfig { directory: string; order: string[]; }