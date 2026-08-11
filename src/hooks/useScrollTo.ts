import { useCallback } from "react";

export function useScrollTo() {
  const scrollTo = useCallback((options: ScrollToOptions | number) => {
    if (typeof options === "number") {
      window.scrollTo({ top: options, behavior: "smooth" });
    } else {
      window.scrollTo({ behavior: "smooth", ...options });
    }
  }, []);

  const scrollToTop = useCallback(() => scrollTo(0), [scrollTo]);
  const scrollToBottom = useCallback(() => {
    scrollTo(document.documentElement.scrollHeight);
  }, [scrollTo]);

  return { scrollTo, scrollToTop, scrollToBottom };
}
