// ============================================================
// SKIP LINKS - Accessible skip navigation component
// ============================================================

import React from 'react';

interface SkipLink {
  targetId: string;
  label: string;
}

const DEFAULT_LINKS: SkipLink[] = [
  { targetId: 'main-content', label: 'Pular para o conteúdo principal' },
  { targetId: 'main-nav', label: 'Pular para a navegação' },
];

interface SkipLinksProps {
  links?: SkipLink[];
}

export const SkipLinks = React.memo(function SkipLinks({ links = DEFAULT_LINKS }: SkipLinksProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav aria-label="Links de acessibilidade" className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:z-[9999] focus-within:top-2 focus-within:left-2">
      {links.map((link) => (
        <a
          key={link.targetId}
          href={`#${link.targetId}`}
          onClick={(e) => handleClick(e, link.targetId)}
          className="block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
});
