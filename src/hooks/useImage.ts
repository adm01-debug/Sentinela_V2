import { useState, useEffect } from "react";

type Status = "idle" | "loading" | "loaded" | "error";

export function useImage(src?: string) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    status,
    isLoading: status === "loading",
    isLoaded: status === "loaded",
    hasError: status === "error",
  };
}
