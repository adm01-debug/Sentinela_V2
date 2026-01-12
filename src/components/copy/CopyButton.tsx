import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

export function CopyButton({ text, className, variant = 'ghost' }: CopyButtonProps) {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Button variant={variant} size="icon" onClick={() => copy(text)} className={cn('h-8 w-8', className)}>
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
