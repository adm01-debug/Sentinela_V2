import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
describe('ThemeProvider', () => {
  it('renders children', () => { render(<ThemeProvider><div>Content</div></ThemeProvider>); expect(screen.getByText('Content')).toBeInTheDocument(); });
  it('applies dark theme', () => { const { container } = render(<ThemeProvider theme="dark"><div>Content</div></ThemeProvider>); expect(container.firstChild).toHaveClass('dark'); });
  it('applies light theme', () => { const { container } = render(<ThemeProvider theme="light"><div>Content</div></ThemeProvider>); expect(container.firstChild).toHaveClass('light'); });
});