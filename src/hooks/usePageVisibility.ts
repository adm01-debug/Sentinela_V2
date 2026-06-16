import { useEffect, useState } from "react";
export function usePageVisibility() {
  const [state] = useState(null);
  useEffect(() => {
    /* implementation */
  }, []);
  return state;
}
