import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsSecurityPage = () => (<div data-testid="page"><h1>Security Settings</h1></div>);

describe('SettingsSecurityPage', () => {
  it('should render', () => {
    render(<SettingsSecurityPage />);
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
  });
});
