/**
 * @fileoverview Advanced CSRF protection types
 * @module @sentinela/core/csrfAdvanced
 * @version 13.0.0
 */

export interface CSRFToken { token: string; sessionId: string; createdAt: Date; expiresAt: Date; }
export interface CSRFConfig { tokenLength: number; ttlSeconds: number; headerName: string; cookieName: string; methods: string[]; }