import { useCallback, useEffect } from "react";

interface SkipLink {
  id: string;
  label: string;
  targetId: string;
}

const defaultLinks: SkipLink[] = [
  { id: "skip-main", label: "Pular para conteúdo principal", targetId: "main-content" },
  { id: "skip-nav", label: "Pular para navegação", targetId: "main-navigation" },
  { id: "skip-search", label: "Pular para busca", targetId: "search-input" },
];

export function useSkipLinks(customLinks?: SkipLink[]) {
  const links = customLinks || defaultLinks;

  const skipTo = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.setAttribute("tabindex", "-1");
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && !e.shiftKey && document.activeElement === document.body) {
        const firstLink = document.getElementById(links[0]?.id);
        if (firstLink) {
          e.preventDefault();
          firstLink.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [links]);

  return { links, skipTo };
}

export default useSkipLinks;
