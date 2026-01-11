import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountdownTimer } from '../CountdownTimer';
describe('CountdownTimer', () => {
  it('renders time', () => { render(<CountdownTimer seconds={120} />); expect(screen.getByText('2:00')).toBeInTheDocument(); });
  it('shows expired', () => { render(<CountdownTimer seconds={0} />); expect(screen.getByText(/expired/i)).toBeInTheDocument(); });
});