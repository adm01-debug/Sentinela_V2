import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Settings from '../Settings';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as usePoliciesHook from '@/hooks/usePolicies';
import * as useApplicationRulesHook from '@/hooks/useApplicationRules';

// Mocks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/hooks/usePolicies', () => ({
  usePolicies: vi.fn(),
}));

vi.mock('@/hooks/useApplicationRules', () => ({
  useApplicationRules: vi.fn(),
}));

// We must mock the actual implementation of tabs if Radix triggers are not working in the test environment
vi.mock('@/components/ui/tabs', async () => {
    const React = await import('react');
    return {
        Tabs: ({ children, defaultValue }: any) => {
            const [activeTab, setActiveTab] = React.useState(defaultValue);
            return (
                <div data-testid="tabs-root">
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child as React.ReactElement<any>, { activeTab, onTabChange: setActiveTab });
                        }
                        return child;
                    })}
                </div>
            );
        },
        TabsList: ({ children, activeTab, onTabChange }: any) => (
            <div>
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child as React.ReactElement<any>, { 
                            active: activeTab === (child.props as any).value, 
                            onClick: () => onTabChange((child.props as any).value) 
                        });
                    }
                    return child;
                })}
            </div>
        ),
        TabsTrigger: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
        TabsContent: ({ children, value, activeTab }: any) => (value === activeTab) ? <div>{children}</div> : null,
    };
});

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

    const mockPolicies = [
      { id: '1', name: 'USB Block', description: '', category: 'device', enabled: true, created_at: '' },
      { id: '2', name: 'Screenshot', description: '', category: 'screen', enabled: false, created_at: '' },
    ];

    vi.mocked(usePoliciesHook.usePolicies).mockReturnValue({
      policies: mockPolicies,
      isLoading: false,
      error: null,
      add: vi.fn(),
      toggle: vi.fn(),
      remove: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useApplicationRulesHook.useApplicationRules).mockReturnValue({
      rules: [
        { id: '1', name: 'Slack', category: 'communication', status: 'allowed', created_at: '', updated_at: '' },
      ],
      isLoading: false,
      isError: false,
      error: null,
      add: vi.fn(),
      updateStatus: vi.fn(),
      editRule: vi.fn(),
      remove: vi.fn(),
    });
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

  it('filters applications by search', async () => {
    vi.mocked(useApplicationRulesHook.useApplicationRules).mockReturnValue({
      rules: [
        { id: '1', name: 'Slack', category: 'communication', status: 'allowed', created_at: '', updated_at: '' },
        { id: '2', name: 'Discord', category: 'communication', status: 'allowed', created_at: '', updated_at: '' },
      ],
      isLoading: false,
      isError: false,
      error: null,
      add: vi.fn(),
      updateStatus: vi.fn(),
      editRule: vi.fn(),
      remove: vi.fn(),
    });
    
    renderSettings();
    
    // Switch to apps tab
    const appsTab = screen.getByText('monitoring.applications');
    fireEvent.click(appsTab);
    
    const searchInput = screen.getByPlaceholderText('common.search');
    fireEvent.change(searchInput, { target: { value: 'Slack' } });
    
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.queryByText('Discord')).not.toBeInTheDocument();
  });
});
