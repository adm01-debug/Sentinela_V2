import { useEffect } from "react";

export function useStylesheet(href) {
  useEffect(() => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);

    return () => { link.remove(); };
  }, [href]);
}
