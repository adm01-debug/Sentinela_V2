import { useState, useCallback } from 'react';
export function useTabs<T extends string>(initial: T, tabs: T[]) {
  const [active, setActive] = useState(initial);
  const isActive = useCallback((tab: T) => active === tab, [active]);
  return { active, setActive, isActive, tabs };
}