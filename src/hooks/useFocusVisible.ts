import { useState, useEffect } from "react";

export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") setIsFocusVisible(true);
    };
    const handleMouseDown = () => setIsFocusVisible(false);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isFocusVisible;
};

export default useFocusVisible;
