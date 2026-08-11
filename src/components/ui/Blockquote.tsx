import * as React from 'react';
import { cn } from '@/utils/cn';

interface BlockquoteProps extends React.BlockquoteHTMLAttributes<HTMLQuoteElement> {
  author?: string;
  source?: string;
}

export function Blockquote({ author, source, className, children, ...props }: BlockquoteProps) {
  return (
    <figure className={cn('border-l-4 border-primary pl-4', className)}>
      <blockquote className="italic text-muted-foreground" {...props}>
        {children}
      </blockquote>
      {(author || source) && (
        <figcaption className="mt-2 text-sm">
          {author && <span className="font-medium">{author}</span>}
          {author && source && <span> — </span>}
          {source && <cite className="text-muted-foreground">{source}</cite>}
        </figcaption>
      )}
    </figure>
  );
}
