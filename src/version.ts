/**
 * @fileoverview Version information
 * @module @sentinela/version
 */
export const VERSION = '13.0.0';
export const BUILD_DATE = '2024-12-25';
export const AUTHOR = 'Sentinela Team';
export const LICENSE = 'MIT';
export const REPOSITORY = 'https://github.com/adm01-debug/sentinela';
export function getVersion(): string { return VERSION; }
export function getBuildInfo(): { version: string; date: string; author: string; license: string; repo: string } { return { version: VERSION, date: BUILD_DATE, author: AUTHOR, license: LICENSE, repo: REPOSITORY }; }
