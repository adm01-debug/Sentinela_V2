import { useState, useEffect, useCallback, memo } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={cn(
        "fixed bottom-20 right-6 z-40 h-10 w-10 rounded-full shadow-lg sm:bottom-6",
        "border-border/60 bg-card/90 backdrop-blur-md",
        "hover:border-primary hover:bg-primary hover:text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "transition-all duration-300",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
});
