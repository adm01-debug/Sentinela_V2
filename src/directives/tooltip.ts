import { useState, useCallback } from 'react';
export function useTooltip(delay = 300) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  let timeout: NodeJS.Timeout;
  const show = useCallback((e: React.MouseEvent) => { timeout = setTimeout(() => { setPosition({ x: e.clientX, y: e.clientY }); setIsVisible(true); }, delay); }, [delay]);
  const hide = useCallback(() => { clearTimeout(timeout); setIsVisible(false); }, []);
  return { isVisible, position, show, hide };
}
