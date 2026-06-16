import { useState, useCallback } from "react";

export const useAnnounce = () => {
  const [message, setMessage] = useState("");
  const [politeness, setPoliteness] = useState<"polite" | "assertive">("polite");

  const announce = useCallback((msg: string, level: "polite" | "assertive" = "polite") => {
    setMessage("");
    setTimeout(() => {
      setMessage(msg);
      setPoliteness(level);
    }, 100);
  }, []);

  return { message, politeness, announce };
};

export default useAnnounce;
