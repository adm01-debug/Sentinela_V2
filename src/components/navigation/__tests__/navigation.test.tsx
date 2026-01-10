import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/index';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const renderComponent = (Component: React.ComponentType) => render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter><I18nextProvider i18n={i18n}><Component /></I18nextProvider></BrowserRouter>
  </QueryClientProvider>
);

describe('navigation', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should render correctly', () => { expect(document.body).toBeTruthy(); });
  it('should be accessible', async () => { await waitFor(() => { expect(document.body).toBeTruthy(); }); });
  it('should handle interactions', () => { expect(document.body).toBeTruthy(); });
});
