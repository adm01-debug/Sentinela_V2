import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateDisplay } from '../DateDisplay';
describe('DateDisplay', () => {
  it('renders date', () => { render(<DateDisplay date="2026-01-15" />); expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument(); });
  it('relative format', () => { render(<DateDisplay date={new Date()} format="relative" />); expect(screen.getByText(/just now|seconds ago/i)).toBeInTheDocument(); });
});