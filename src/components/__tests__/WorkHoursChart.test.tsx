import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkHoursChart } from '../WorkHoursChart';
describe('WorkHoursChart', () => {
  const data = [{ day: 'Mon', hours: 8 }, { day: 'Tue', hours: 7.5 }, { day: 'Wed', hours: 9 }];
  it('renders', () => { render(<WorkHoursChart data={data} />); expect(screen.getByTestId('work-hours-chart')).toBeInTheDocument(); });
  it('shows total', () => { render(<WorkHoursChart data={data} showTotal />); expect(screen.getByText('24.5h')).toBeInTheDocument(); });
  it('empty state', () => { render(<WorkHoursChart data={[]} />); expect(screen.getByText(/no data/i)).toBeInTheDocument(); });
});