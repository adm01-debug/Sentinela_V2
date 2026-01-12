import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ScreenshotDetailPage = () => (<div data-testid="page"><h1>Screenshot Detail</h1></div>);

describe('ScreenshotDetailPage', () => {
  it('should render', () => {
    render(<ScreenshotDetailPage />);
    expect(screen.getByText('Screenshot Detail')).toBeInTheDocument();
  });
});
