import { useState, useCallback } from "react";

interface Shift { id: string; employeeId: string; start: Date; end: Date; }

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);

  const add = useCallback((employeeId: string, start: Date, end: Date) => {
    const shift: Shift = { id: crypto.randomUUID(), employeeId, start, end };
    setShifts(prev => [...prev, shift]);
    return shift;
  }, []);

  const remove = useCallback((id: any) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  }, []);

  const getByEmployee = useCallback((employeeId) => {
    return shifts.filter(s => s.employeeId === employeeId);
  }, [shifts]);

  return { shifts, add, remove, getByEmployee };
}
