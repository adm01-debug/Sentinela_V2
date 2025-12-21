import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import WhatsAppIntegration from '../WhatsAppIntegration';

vi.mock('@/hooks/useWhatsAppIntegrationPage', () => ({
  useWhatsAppIntegrationPage: () => ({ data: null, isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('WhatsAppIntegration Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><WhatsAppIntegration /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});