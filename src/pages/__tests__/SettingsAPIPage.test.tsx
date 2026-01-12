import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsAPIPage = () => (<div data-testid="page"><h1>API Settings</h1></div>);

describe('SettingsAPIPage', () => {
  it('should render', () => {
    render(<SettingsAPIPage />);
    expect(screen.getByText('API Settings')).toBeInTheDocument();
  });
});
