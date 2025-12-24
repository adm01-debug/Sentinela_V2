export class LazyImage {
  private observer: IntersectionObserver | null = null;
  init(): void { this.observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { const img = entry.target as HTMLImageElement; const src = img.dataset.src; if (src) { img.src = src; img.removeAttribute('data-src'); } this.observer?.unobserve(img); } }); }, { rootMargin: '50px' }); }
  observe(img: HTMLImageElement): void { this.observer?.observe(img); }
  disconnect(): void { this.observer?.disconnect(); }
}
export const lazyImage = new LazyImage();
