import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Timeline, TimelineItem } from '../Timeline';

describe('Timeline', () => {
  it('renders items', () => {
    render(
      <Timeline>
        <TimelineItem title="Event 1">Description 1</TimelineItem>
        <TimelineItem title="Event 2">Description 2</TimelineItem>
      </Timeline>
    );
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  it('renders with timestamps', () => {
    render(
      <Timeline>
        <TimelineItem title="Event" time="10:00 AM">Content</TimelineItem>
      </Timeline>
    );
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('applies color to dots', () => {
    render(
      <Timeline>
        <TimelineItem title="Success" color="green">Done</TimelineItem>
      </Timeline>
    );
    expect(screen.getByTestId('timeline-dot')).toHaveClass('green');
  });
});