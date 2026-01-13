import { useEffect, useRef, useState } from "react";
export function usePageVisibility() {
  const [state, setState] = useState(null);
  useEffect(() => { /* implementation */ }, []);
  return state;
}
