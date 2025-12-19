import { useEffect, useRef } from 'react';

// ============================================================
// useDocumentTitle - Set document title
// ============================================================

/**
 * Set the document title
 * @param title - The title to set
 * @param options - Configuration options
 */
export function useDocumentTitle(
  title: string,
  options: { restoreOnUnmount?: boolean; suffix?: string } = {}
): void {
  const { restoreOnUnmount = true, suffix = ' | Sentinela' } = options;
  const previousTitle = useRef(document.title);

  useEffect(() => {
    const fullTitle = title ? `${title}${suffix}` : 'Sentinela';
    document.title = fullTitle;
  }, [title, suffix]);

  useEffect(() => {
    if (restoreOnUnmount) {
      return () => {
        document.title = previousTitle.current;
      };
    }
  }, [restoreOnUnmount]);
}

// ============================================================
// usePageTitle - Alias with default suffix
// ============================================================

/**
 * Alias for useDocumentTitle with sensible defaults
 */
export function usePageTitle(title: string): void {
  useDocumentTitle(title);
}

// ============================================================
// useTitleWithNotificationCount - Title with notification badge
// ============================================================

/**
 * Set title with optional notification count
 * Shows: "(3) Dashboard | Sentinela" when count > 0
 */
export function useTitleWithNotificationCount(
  title: string,
  count: number
): void {
  const fullTitle = count > 0 ? `(${count}) ${title}` : title;
  useDocumentTitle(fullTitle);
}
