import { useState, useCallback } from "react";

interface ShareData { title?: string; text?: string; url?: string; }

export function useShare() {
  const [shared, setShared] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const share = useCallback(async (data) => {
    if (!canShare) return false;
    try {
      await navigator.share(data);
      setShared(true);
      return true;
    } catch { return false; }
  }, [canShare]);

  return { share, shared, canShare };
}
