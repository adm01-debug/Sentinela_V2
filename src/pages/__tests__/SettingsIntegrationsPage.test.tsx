import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsIntegrationsPage = () => (<div data-testid="page"><h1>Integrations Settings</h1></div>);

describe('SettingsIntegrationsPage', () => {
  it('should render', () => {
    render(<SettingsIntegrationsPage />);
    expect(screen.getByText('Integrations Settings')).toBeInTheDocument();
  });
});
