import { memo } from 'react';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

function SkipLinkComponent({ href = '#main-content', children = 'Pular para conteudo principal' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded-md focus:shadow-lg"
    >
      {children}
    </a>
  );
}

export const SkipLink = memo(SkipLinkComponent);
