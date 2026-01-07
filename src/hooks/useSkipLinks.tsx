import { useCallback, useEffect, useRef } from 'react';

export interface SkipLink {
  id: string;
  label: string;
  targetId: string;
}

export interface UseSkipLinksOptions {
  links?: SkipLink[];
  defaultLinks?: boolean;
}

const DEFAULT_LINKS: SkipLink[] = [
  { id: 'skip-to-main', label: 'Skip to main content', targetId: 'main-content' },
  { id: 'skip-to-nav', label: 'Skip to navigation', targetId: 'main-nav' },
  { id: 'skip-to-search', label: 'Skip to search', targetId: 'search-input' },
];

export function useSkipLinks(options: UseSkipLinksOptions = {}) {
  const { links = [], defaultLinks = true } = options;
  const skipLinksRef = useRef<HTMLDivElement | null>(null);

  const allLinks = defaultLinks ? [...DEFAULT_LINKS, ...links] : links;

  const skipTo = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.setAttribute('tabindex', '-1');
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey && skipLinksRef.current) {
      const firstSkipLink = skipLinksRef.current.querySelector('a');
      if (document.activeElement === document.body && firstSkipLink) {
        e.preventDefault();
        (firstSkipLink as HTMLElement).focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const SkipLinksContainer = useCallback(({ className }: { className?: string }) => (
    <div ref={skipLinksRef} className={className || 'sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-50 focus-within:bg-background focus-within:p-4'}>
      {allLinks.map(link => (
        <a key={link.id} href={`#${link.targetId}`} onClick={e => { e.preventDefault(); skipTo(link.targetId); }} className="block p-2 text-primary underline focus:ring-2 focus:ring-primary">{link.label}</a>
      ))}
    </div>
  ), [allLinks, skipTo]);

  return { skipTo, SkipLinksContainer, links: allLinks };
}

export default useSkipLinks;
