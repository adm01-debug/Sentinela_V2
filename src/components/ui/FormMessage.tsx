import * as React from 'react';
import { cn } from '@/utils/cn';

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> { error?: boolean; }

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, error = true, ...props }, ref) => {
    if (!children) return null;
    return (
      <p ref={ref} className={cn('text-sm font-medium', error ? 'text-destructive' : 'text-muted-foreground', className)} {...props}>
        {children}
      </p>
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { FormMessage };
