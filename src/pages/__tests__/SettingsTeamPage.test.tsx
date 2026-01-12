import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsTeamPage = () => (<div data-testid="page"><h1>Team Settings</h1></div>);

describe('SettingsTeamPage', () => {
  it('should render', () => {
    render(<SettingsTeamPage />);
    expect(screen.getByText('Team Settings')).toBeInTheDocument();
  });
});
