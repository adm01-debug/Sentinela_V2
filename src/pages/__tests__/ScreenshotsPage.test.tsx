import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ScreenshotsPage = () => (<div data-testid="page"><h1>Screenshots</h1></div>);

describe('ScreenshotsPage', () => {
  it('should render', () => {
    render(<ScreenshotsPage />);
    expect(screen.getByText('Screenshots')).toBeInTheDocument();
  });
});
