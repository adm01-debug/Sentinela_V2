import * as React from 'react';
import { Button as BaseButton, ButtonProps } from './button';

interface A11yButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
}

export const A11yButton = React.forwardRef<HTMLButtonElement, A11yButtonProps>(
  ({ children, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {children}
      </BaseButton>
    );
  }
);

A11yButton.displayName = 'A11yButton';
