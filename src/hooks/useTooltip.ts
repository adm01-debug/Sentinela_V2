import { useState, useCallback } from 'react';
export function useTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const show = useCallback((e: React.MouseEvent) => { setPosition({ x: e.clientX, y: e.clientY }); setIsVisible(true); }, []);
  const hide = useCallback(() => setIsVisible(false), []);
  return { isVisible, position, show, hide };
}