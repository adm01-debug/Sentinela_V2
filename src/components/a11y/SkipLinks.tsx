import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkipLink { id: string; label: string; targetId: string; }

const defaultLinks: SkipLink[] = [
  { id: 'skip-main', label: 'Skip to main content', targetId: 'main-content' },
  { id: 'skip-nav', label: 'Skip to navigation', targetId: 'main-nav' },
  { id: 'skip-search', label: 'Skip to search', targetId: 'search-input' },
];

export function SkipLinks({ links = defaultLinks, className }: { links?: SkipLink[]; className?: string }) {
  const handleClick = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) { element.setAttribute('tabindex', '-1'); element.focus(); element.scrollIntoView({ behavior: 'smooth' }); }
  };

  return (
    <div className={cn('sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50', className)}>
      {links.map(link => (
        <a key={link.id} href={`#${link.targetId}`} onClick={handleClick(link.targetId)} className="block bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-ring mb-2">
          {link.label}
        </a>
      ))}
    </div>
  );
}
export default SkipLinks;
