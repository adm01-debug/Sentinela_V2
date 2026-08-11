import { useState, useEffect, useCallback, memo } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Floating scroll-to-top button that appears after scrolling 400px.
 * Uses design system tokens for consistent styling.
 */
export const ScrollToTopButton = memo(function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={cn(
        'fixed bottom-20 sm:bottom-6 right-6 z-40 h-10 w-10 rounded-full shadow-lg',
        'bg-card/90 backdrop-blur-md border-border/60',
        'hover:bg-primary hover:text-primary-foreground hover:border-primary',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'transition-all duration-300',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
});
