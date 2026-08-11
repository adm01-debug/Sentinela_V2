import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PresentationModeProps {
  /** Slides to cycle through in fullscreen. */
  slides: { id: string; title: string; content: ReactNode }[];
  /** Interval in ms between auto-advance slides. */
  intervalMs?: number;
}

/**
 * P4 — Modo Apresentação.
 * Fullscreen dashboard mode that auto-cycles through slides.
 * Keyboard: ESC to exit, Space to pause/play, ←/→ to navigate.
 * Respects prefers-reduced-motion.
 */
export function PresentationMode({ slides, intervalMs = 8000 }: PresentationModeProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const close = useCallback(() => {
    setOpen(false);
    setIndex(0);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const enter = useCallback(async () => {
    setOpen(true);
    setPlaying(true);
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* fullscreen denied — modal fallback */
    }
  }, []);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % Math.max(slides.length, 1)),
    [slides.length]
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + slides.length) % Math.max(slides.length, 1)),
    [slides.length]
  );

  useEffect(() => {
    if (!open || !playing || slides.length <= 1) return;
    const t = window.setInterval(next, intervalMs);
    return () => window.clearInterval(t);
  }, [open, playing, next, intervalMs, slides.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const onFsChange = () => {
      if (!document.fullscreenElement && open) setOpen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [open, close, next, prev]);

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={enter}
        className="min-h-11 min-w-11 gap-1.5"
        aria-label="Iniciar modo apresentação"
        disabled={slides.length === 0}
      >
        <Maximize2 className="h-4 w-4" />
        <span className="hidden md:inline">Apresentação</span>
      </Button>
    );
  }

  const slide = slides[index];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modo apresentação"
      className="fixed inset-0 z-[100] bg-background flex flex-col motion-safe:animate-in motion-safe:fade-in"
    >
      <header className="flex items-center justify-between px-8 py-5 border-b">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Slide {index + 1} / {slides.length}
          </p>
          <h2 className="text-2xl font-semibold mt-1">{slide?.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            className="h-11 w-11"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPlaying((p) => !p)}
            className="h-11 w-11"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-11 w-11"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={close}
            className="h-11 w-11"
            aria-label="Sair da apresentação (ESC)"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div
          key={slide?.id}
          className="max-w-[1400px] mx-auto motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        >
          {slide?.content}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted" aria-hidden="true">
        <div
          className="h-full bg-primary motion-safe:transition-all"
          style={{ width: `${((index + 1) / Math.max(slides.length, 1)) * 100}%` }}
        />
      </div>
    </div>,
    document.body
  );
}
