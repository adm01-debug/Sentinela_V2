/**
 * @fileoverview File utilities
 * @module @sentinela/core/file
 */
import * as fs from 'fs/promises';
import * as path from 'path';
export async function readJson<T>(filePath: string): Promise<T> { const content = await fs.readFile(filePath, 'utf8'); return JSON.parse(content); }
export async function writeJson(filePath: string, data: unknown): Promise<void> { await fs.writeFile(filePath, JSON.stringify(data, null, 2)); }
export async function exists(filePath: string): Promise<boolean> { try { await fs.access(filePath); return true; } catch { return false; } }
export async function ensureDir(dirPath: string): Promise<void> { await fs.mkdir(dirPath, { recursive: true }); }
export function join(...paths: string[]): string { return path.join(...paths); }
export function basename(filePath: string): string { return path.basename(filePath); }
export function dirname(filePath: string): string { return path.dirname(filePath); }
