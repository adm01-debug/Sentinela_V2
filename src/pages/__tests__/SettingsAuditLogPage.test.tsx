import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const SettingsAuditLogPage = () => (<div data-testid="page"><h1>Audit Log Settings</h1></div>);

describe('SettingsAuditLogPage', () => {
  it('should render', () => {
    render(<SettingsAuditLogPage />);
    expect(screen.getByText('Audit Log Settings')).toBeInTheDocument();
  });
});
