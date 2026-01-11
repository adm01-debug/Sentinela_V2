import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsightCard } from '../InsightCard';
describe('InsightCard', () => {
  const insight = { title: 'Productivity Up', description: 'Team productivity increased by 15%', type: 'positive', metric: '+15%' };
  it('renders insight', () => { render(<InsightCard insight={insight} />); expect(screen.getByText('Productivity Up')).toBeInTheDocument(); });
  it('shows description', () => { render(<InsightCard insight={insight} />); expect(screen.getByText(/increased by 15%/)).toBeInTheDocument(); });
  it('shows metric', () => { render(<InsightCard insight={insight} />); expect(screen.getByText('+15%')).toBeInTheDocument(); });
  it('applies type style', () => { const { container } = render(<InsightCard insight={insight} />); expect(container.firstChild).toHaveClass('positive'); });
});