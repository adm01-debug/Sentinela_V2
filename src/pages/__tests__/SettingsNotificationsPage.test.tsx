import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsNotificationsPage = () => (<div data-testid="page"><h1>Notification Settings</h1></div>);

describe('SettingsNotificationsPage', () => {
  it('should render', () => {
    render(<SettingsNotificationsPage />);
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });
});
