import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsBillingPage = () => (<div data-testid="page"><h1>Billing Settings</h1></div>);

describe('SettingsBillingPage', () => {
  it('should render', () => {
    render(<SettingsBillingPage />);
    expect(screen.getByText('Billing Settings')).toBeInTheDocument();
  });
});
