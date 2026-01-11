import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> { label?: string; }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <div className={cn('h-4 w-4 rounded border border-primary ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-checked:bg-primary peer-checked:text-primary-foreground', className)}>
          <Check className="h-3 w-3 hidden peer-checked:block" />
        </div>
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
);
Checkbox.displayName = 'Checkbox';