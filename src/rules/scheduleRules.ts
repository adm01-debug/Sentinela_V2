export const scheduleRules = {
  isValidSchedule: (start: Date, end: Date): boolean => start < end,
  hasConflict: (newStart: Date, newEnd: Date, existing: { start: Date; end: Date }[]): boolean => existing.some(e => newStart < e.end && newEnd > e.start),
  getNextAvailableSlot: (existing: { start: Date; end: Date }[], duration: number): Date => { const sorted = [...existing].sort((a, b) => a.start.getTime() - b.start.getTime()); let candidate = new Date(); for (const slot of sorted) { if (candidate.getTime() + duration <= slot.start.getTime()) return candidate; candidate = new Date(slot.end); } return candidate; },
  isWithinWorkingHours: (date: Date, start = 9, end = 18): boolean => { const hour = date.getHours(); return hour >= start && hour < end; },
};
