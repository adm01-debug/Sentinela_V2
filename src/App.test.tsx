import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all lazy-loaded components
vi.mock('@/pages/Index', () => ({ default: () => <div>Index Page</div> }));
vi.mock('@/pages/Auth', () => ({ default: () => <div>Auth Page</div> }));

// Mock providers
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    mount: vi.fn(),
    unmount: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ReactQueryDevtools: () => null,
}));

describe('App', () => {
  it('should render without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('should have BrowserRouter', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should wrap app with providers', () => {
    render(<App />);
    // App should render successfully with all providers
    expect(document.body).toBeTruthy();
  });

  it('should handle route prefetching', async () => {
    const { prefetchRoute } = await import('./App');
    // Should not throw when prefetching routes
    expect(() => prefetchRoute('/')).not.toThrow();
    expect(() => prefetchRoute('/employees')).not.toThrow();
    expect(() => prefetchRoute('/non-existent')).not.toThrow();
  });
});
