import { Preloader, PreloadStrategy, ResourceHint } from '../../preloading';
describe('Preloader', () => {
  let preloader: Preloader;
  beforeEach(() => { preloader = new Preloader(); });
  it('should add preload hints', () => {
    preloader.addHint({ type: 'preload', href: '/style.css', as: 'style' });
    const hints = preloader.getHints();
    expect(hints.length).toBe(1);
  });
  it('should add prefetch hints', () => {
    preloader.addHint({ type: 'prefetch', href: '/next-page.html' });
    const hints = preloader.getHints('prefetch');
    expect(hints.length).toBe(1);
  });
  it('should generate link tags', () => {
    preloader.addHint({ type: 'preload', href: '/font.woff2', as: 'font' });
    const html = preloader.generateHTML();
    expect(html).toContain('<link');
  });
  it('should prioritize critical resources', () => {
    preloader.addHint({ type: 'preload', href: '/a.js', priority: 'low' });
    preloader.addHint({ type: 'preload', href: '/b.js', priority: 'high' });
    const sorted = preloader.getSortedHints();
    expect(sorted[0].href).toBe('/b.js');
  });
});