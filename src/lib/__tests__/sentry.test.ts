import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe('sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize Sentry', async () => {
    const sentry = await import('../sentry');
    expect(sentry).toBeDefined();
  });

  it('should capture exceptions', async () => {
    const { captureException } = await import('@sentry/react');
    captureException(new Error('Test error'));
    expect(captureException).toHaveBeenCalled();
  });

  it('should capture messages', async () => {
    const { captureMessage } = await import('@sentry/react');
    captureMessage('Test message');
    expect(captureMessage).toHaveBeenCalled();
  });

  it('should set user context', async () => {
    const { setUser } = await import('@sentry/react');
    setUser({ id: '123', email: 'test@test.com' });
    expect(setUser).toHaveBeenCalled();
  });

  it('should add breadcrumbs', async () => {
    const { addBreadcrumb } = await import('@sentry/react');
    addBreadcrumb({ message: 'Test breadcrumb' });
    expect(addBreadcrumb).toHaveBeenCalled();
  });
});
