import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface SensitiveDataProps {
  data: string;
  className?: string;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({ data, className }) => {
  const [visible, setVisible] = useState(false);
  const maskedData = useMemo(() => '•'.repeat(data.length), [data.length]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-mono" aria-live="polite">
        {visible ? data : maskedData}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="p-1 rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={visible ? 'Ocultar dado sensível' : 'Mostrar dado sensível'}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
