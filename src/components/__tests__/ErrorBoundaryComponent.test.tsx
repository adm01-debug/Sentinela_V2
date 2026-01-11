import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
const ThrowError = () => { throw new Error('Test error'); };
describe('ErrorBoundary', () => {
  beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });
  it('renders children when no error', () => { render(<ErrorBoundary><div>Content</div></ErrorBoundary>); expect(screen.getByText('Content')).toBeInTheDocument(); });
  it('renders fallback on error', () => { render(<ErrorBoundary fallback={<div>Error occurred</div>}><ThrowError /></ErrorBoundary>); expect(screen.getByText('Error occurred')).toBeInTheDocument(); });
  it('calls onError callback', () => { const onError = vi.fn(); render(<ErrorBoundary onError={onError}><ThrowError /></ErrorBoundary>); expect(onError).toHaveBeenCalled(); });
});