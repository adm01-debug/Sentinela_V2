export function isValidDate(dateStr: string): boolean { const date = new Date(dateStr); return !isNaN(date.getTime()); }
export function isDateInRange(date: Date, start: Date, end: Date): boolean { return date >= start && date <= end; }
export function isFutureDate(date: Date): boolean { return date > new Date(); }
export function isPastDate(date: Date): boolean { return date < new Date(); }
export function isBusinessDay(date: Date): boolean { const day = date.getDay(); return day !== 0 && day !== 6; }
export function getAge(birthDate: Date): number { const today = new Date(); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--; return age; }
