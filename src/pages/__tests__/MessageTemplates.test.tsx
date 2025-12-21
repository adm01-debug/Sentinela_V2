import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import MessageTemplates from '../MessageTemplates';

vi.mock('@/hooks/useMessageTemplatesPage', () => ({
  useMessageTemplatesPage: () => ({ data: [], isLoading: false })
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('MessageTemplates Page', () => {
  it('renders the page', () => {
    render(<QueryClientProvider client={queryClient}><BrowserRouter><MessageTemplates /></BrowserRouter></QueryClientProvider>);
    expect(document.body).toBeDefined();
  });
});