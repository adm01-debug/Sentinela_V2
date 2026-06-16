import { useRef, useEffect } from "react";

export const useFocusReturn = (isOpen: boolean) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  return previousActiveElement;
};

export default useFocusReturn;
