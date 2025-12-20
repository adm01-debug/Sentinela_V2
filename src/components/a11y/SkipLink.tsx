import { memo } from 'react';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

function SkipLinkComponent({ href = '#main-content', children = 'Pular para conteúdo principal' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none focus:font-medium focus:text-sm transition-all"
    >
      {children}
    </a>
  );
}

export const SkipLink = memo(SkipLinkComponent);
