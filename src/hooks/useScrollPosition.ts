import { useState, useEffect } from "react";
export const useScrollPosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = () => setPosition({ x: window.scrollX, y: window.scrollY });
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return position;
};
