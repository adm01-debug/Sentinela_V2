import { useEffect } from "react";

export function useMount(callback: () => void | (() => void)) {
  useEffect(() => {
    return callback();
    // Intentionally run only on mount; callback is captured once by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
