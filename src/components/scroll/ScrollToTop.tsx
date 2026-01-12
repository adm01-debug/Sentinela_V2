import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ScrollToTop({ threshold = 300 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      className={cn('fixed bottom-6 right-6 z-50 transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}
