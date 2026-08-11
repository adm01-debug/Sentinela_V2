import * as React from 'react';
import { cn } from '@/utils/cn';

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
}

export function Code({ inline = true, className, children, ...props }: CodeProps) {
  if (inline) {
    return (
      <code className={cn('relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm', className)} {...props}>
        {children}
      </code>
    );
  }

  return (
    <pre className={cn('overflow-x-auto rounded-lg bg-muted p-4', className)} {...props}>
      <code className="font-mono text-sm">{children}</code>
    </pre>
  );
}
