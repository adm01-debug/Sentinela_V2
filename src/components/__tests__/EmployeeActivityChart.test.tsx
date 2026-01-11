import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmployeeActivityChart } from '../EmployeeActivityChart';
describe('EmployeeActivityChart', () => {
  const data = [{ date: '2026-01-01', hours: 8 }, { date: '2026-01-02', hours: 7.5 }];
  it('renders chart', () => { render(<EmployeeActivityChart data={data} />); expect(screen.getByTestId('activity-chart')).toBeInTheDocument(); });
  it('shows total hours', () => { render(<EmployeeActivityChart data={data} showTotal />); expect(screen.getByText('15.5h')).toBeInTheDocument(); });
  it('handles empty data', () => { render(<EmployeeActivityChart data={[]} />); expect(screen.getByText(/no activity/i)).toBeInTheDocument(); });
  it('supports different periods', () => { render(<EmployeeActivityChart data={data} period="week" />); expect(screen.getByText(/weekly/i)).toBeInTheDocument(); });
});