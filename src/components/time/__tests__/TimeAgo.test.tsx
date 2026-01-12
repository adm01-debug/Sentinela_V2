import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeAgo } from '../TimeAgo';

describe('TimeAgo', () => {
  it('should render time ago text', () => {
    const recentDate = new Date(Date.now() - 60000);
    render(<TimeAgo date={recentDate} />);
    expect(screen.getByText(/minuto/i)).toBeInTheDocument();
  });

  it('should have datetime attribute', () => {
    const date = new Date();
    render(<TimeAgo date={date} />);
    expect(screen.getByRole('time')).toHaveAttribute('datetime');
  });
});
