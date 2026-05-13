import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Settings from '../Settings';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as useSettingsHook from '@/hooks/useSettings';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/useSettings', () => ({
  useSettings: vi.fn(),
}));

vi.mock('@/components/PolicyToggle', () => ({
  PolicyToggle: ({ policy }: any) => <div data-testid="policy-toggle">{policy.name}</div>,
}));

vi.mock('@/components/ApplicationRuleRow', () => ({
  ApplicationRuleRow: ({ rule }: any) => <div data-testid="app-rule">{rule.name}</div>,
}));

vi.mock('@/components/AddApplicationDialog', () => ({
  AddApplicationDialog: () => <div data-testid="add-app-dialog" />,
}));

vi.mock('@/components/EditApplicationDialog', () => ({
  EditApplicationDialog: () => <div data-testid="edit-app-dialog" />,
}));

vi.mock('@/components/SettingsAuditLog', () => ({
  SettingsAuditLog: () => <div data-testid="settings-audit-log" />,
}));

vi.mock('@/components/MFASettings', () => ({
  MFASettings: () => <div data-testid="mfa-settings" />,
}));

vi.mock('@/components/AlertSettingsPanel', () => ({
  AlertSettingsPanel: () => <div data-testid="alert-settings-panel" />,
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useSettingsHook.useSettings).mockReturnValue({
      data: {
        policies: [
          { id: '1', name: 'USB Block', category: 'device', enabled: true },
          { id: '2', name: 'Screenshot', category: 'screen', enabled: false },
        ],
        appRules: [
          { id: '1', name: 'Slack', category: 'communication', status: 'allowed' },
        ],
      },
      isLoading: false,
    } as any);
  });

  const renderSettings = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders tabs correctly', () => {
    renderSettings();
    expect(screen.getByText('navigation.policies')).toBeInTheDocument();
    expect(screen.getByText('monitoring.applications')).toBeInTheDocument();
    expect(screen.getByText('settings.alerts')).toBeInTheDocument();
    expect(screen.getByText('common.profile')).toBeInTheDocument();
  });

  it('renders policies by default', () => {
    renderSettings();
    expect(screen.getByText('USB Block')).toBeInTheDocument();
    expect(screen.getByText('Screenshot')).toBeInTheDocument();
  });

  it('switches to applications tab', () => {
    renderSettings();
    const appsTab = screen.getByText('monitoring.applications');
    fireEvent.click(appsTab);
    
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByTestId('add-app-dialog')).toBeInTheDocument();
  });

  it('filters applications by search', async () => {
    vi.mocked(useSettingsHook.useSettings).mockReturnValue({
      data: {
        policies: [],
        appRules: [
          { id: '1', name: 'Slack', category: 'communication', status: 'allowed' },
          { id: '2', name: 'Discord', category: 'communication', status: 'allowed' },
        ],
      },
      isLoading: false,
    } as any);
    
    renderSettings();
    fireEvent.click(screen.getByText('monitoring.applications'));
    
    const searchInput = screen.getByPlaceholderText('common.search');
    fireEvent.change(searchInput, { target: { value: 'Slack' } });
    
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.queryByText('Discord')).not.toBeInTheDocument();
  });
});
