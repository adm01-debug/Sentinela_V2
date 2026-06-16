import { useState, useCallback, useEffect, useRef } from "react";

interface SkipLink {
  id: string;
  label: string;
  target: string;
  order?: number;
}

interface UseSkipLinksOptions {
  links?: SkipLink[];
  containerSelector?: string;
  focusDelay?: number;
  announceSkip?: boolean;
}

interface UseSkipLinksReturn {
  links: SkipLink[];
  activeLink: string | null;
  skipTo: (targetId) => void;
  addLink: (link: SkipLink) => void;
  removeLink: (id: string) => void;
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  handleKeyDown: (e: KeyboardEvent) => void;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { id: "skip-main", label: "Skip to main content", target: "main-content", order: 1 },
  { id: "skip-nav", label: "Skip to navigation", target: "main-navigation", order: 2 },
  { id: "skip-search", label: "Skip to search", target: "search-input", order: 3 },
  { id: "skip-footer", label: "Skip to footer", target: "footer", order: 4 },
];

export function useSkipLinks(options: UseSkipLinksOptions = {}): UseSkipLinksReturn {
  const {
    links: initialLinks = DEFAULT_SKIP_LINKS,
    focusDelay = 100,
    announceSkip = true,
  } = options;

  const [links, setLinks] = useState<SkipLink[]>(initialLinks);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [isVisible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const sortedLinks = [...links].sort((a, b) => (a.order || 0) - (b.order || 0));

  const skipTo = useCallback(
    (targetId) => {
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        setActiveLink(targetId);

        // Make element focusable if it isn't
        if (!targetElement.hasAttribute("tabindex")) {
          targetElement.setAttribute("tabindex", "-1");
        }

        setTimeout(() => {
          targetElement.focus({ preventScroll: false });
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

          if (announceSkip && announcerRef.current) {
            const link = links.find((l) => l.target === targetId);
            announcerRef.current.textContent = `Navigated to ${link?.label || targetId}`;
          }
        }, focusDelay);

        setVisible(false);
      }
    },
    [links, focusDelay, announceSkip]
  );

  const addLink = useCallback((link: SkipLink) => {
    setLinks((prev) => {
      const exists = prev.some((l) => l.id === link.id);
      if (exists) return prev;
      return [...prev, link];
    });
  }, []);

  const removeLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Tab" && !e.shiftKey) {
      const activeElement = document.activeElement;
      const isFirstFocusable =
        activeElement === document.body || activeElement === document.documentElement;

      if (isFirstFocusable) {
        setVisible(true);
      }
    }

    if (e.key === "Escape") {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    // Create screen reader announcer
    if (announceSkip && typeof document !== "undefined") {
      const announcer = document.createElement("div");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (announcerRef.current) {
        announcerRef.current.remove();
      }
    };
  }, [handleKeyDown, announceSkip]);

  return {
    links: sortedLinks,
    activeLink,
    skipTo,
    addLink,
    removeLink,
    isVisible,
    setVisible,
    containerRef,
    handleKeyDown,
  };
}

export default useSkipLinks;
