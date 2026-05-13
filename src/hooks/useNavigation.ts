import { useCallback } from "react";

export function useNavigation() {
  const navigate = useCallback((path) => {
    if (options?.replace) {
      window.history.replaceState(null, "", path);
    } else {
      window.history.pushState(null, "", path);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const back = useCallback(() => window.history.back(), []);
  const forward = useCallback(() => window.history.forward(), []);

  return { navigate, back, forward };
}
