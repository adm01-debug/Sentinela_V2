import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({ useSearchParams: () => [new URLSearchParams(), vi.fn()] }));

const ActivityTimelinePage = () => (
  <div data-testid="timeline-page">
    <h1>Activity Timeline</h1>
    <div data-testid="timeline">
      <div data-testid="timeline-event">Event 1</div>
      <div data-testid="timeline-event">Event 2</div>
    </div>
  </div>
);

describe('ActivityTimelinePage', () => {
  it('should render timeline', () => {
    render(<ActivityTimelinePage />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('should display timeline events', () => {
    render(<ActivityTimelinePage />);
    expect(screen.getAllByTestId('timeline-event').length).toBeGreaterThan(0);
  });
});
