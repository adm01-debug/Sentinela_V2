/**
 * @fileoverview Money utilities
 * @module @sentinela/core/money
 */
export interface Money { amount: number; currency: string; }
export function money(amount: number, currency: string = 'USD'): Money { return { amount, currency }; }
export function add(a: Money, b: Money): Money { if (a.currency !== b.currency) throw new Error('Currency mismatch'); return { amount: a.amount + b.amount, currency: a.currency }; }
export function subtract(a: Money, b: Money): Money { if (a.currency !== b.currency) throw new Error('Currency mismatch'); return { amount: a.amount - b.amount, currency: a.currency }; }
export function multiply(m: Money, factor: number): Money { return { amount: m.amount * factor, currency: m.currency }; }
export function format(m: Money, locale: string = 'en-US'): string { return new Intl.NumberFormat(locale, { style: 'currency', currency: m.currency }).format(m.amount / 100); }
