import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkipLink {
  id: string;
  label: string;
  targetId: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

const DEFAULT_LINKS: SkipLink[] = [
  { id: 'skip-main', label: 'Skip to main content', targetId: 'main-content' },
  { id: 'skip-nav', label: 'Skip to navigation', targetId: 'main-nav' },
  { id: 'skip-search', label: 'Skip to search', targetId: 'search-input' },
];

export function SkipLinks({ links = DEFAULT_LINKS, className }: SkipLinksProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={cn('sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-[100] focus-within:bg-background focus-within:p-4 focus-within:shadow-lg', className)}>
      <nav aria-label="Skip links">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.targetId}`}
                onClick={(e) => handleClick(e, link.targetId)}
                className="block px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default SkipLinks;
