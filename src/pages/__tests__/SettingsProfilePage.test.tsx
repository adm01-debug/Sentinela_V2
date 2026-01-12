import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsProfilePage = () => (<div data-testid="page"><h1>Profile Settings</h1></div>);

describe('SettingsProfilePage', () => {
  it('should render', () => {
    render(<SettingsProfilePage />);
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
  });
});
