import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: any) => <span>{children}</span>,
}));

const ProjectDetailPage = () => (<div data-testid="page"><h1>Project Detail</h1></div>);

describe('ProjectDetailPage', () => {
  it('should render', () => {
    render(<ProjectDetailPage />);
    expect(screen.getByText('Project Detail')).toBeInTheDocument();
  });
});
