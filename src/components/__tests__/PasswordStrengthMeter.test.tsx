import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
describe('PasswordStrengthMeter', () => {
  it('shows weak for short password', () => { render(<PasswordStrengthMeter password="abc" />); expect(screen.getByText('Weak')).toBeInTheDocument(); });
  it('shows medium for decent password', () => { render(<PasswordStrengthMeter password="Abc123!" />); expect(screen.getByText('Medium')).toBeInTheDocument(); });
  it('shows strong for complex password', () => { render(<PasswordStrengthMeter password="Abc123!@#XyzLong" />); expect(screen.getByText('Strong')).toBeInTheDocument(); });
  it('shows progress bar', () => { render(<PasswordStrengthMeter password="test" />); expect(screen.getByRole('progressbar')).toBeInTheDocument(); });
});