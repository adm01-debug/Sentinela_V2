import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrencyDisplay } from '../CurrencyDisplay';
describe('CurrencyDisplay', () => {
  it('renders USD', () => { render(<CurrencyDisplay value={1000} currency="USD" />); expect(screen.getByText('$1,000.00')).toBeInTheDocument(); });
  it('renders EUR', () => { render(<CurrencyDisplay value={1000} currency="EUR" />); expect(screen.getByText('€1,000.00')).toBeInTheDocument(); });
  it('renders BRL', () => { render(<CurrencyDisplay value={1000} currency="BRL" />); expect(screen.getByText('R$1,000.00')).toBeInTheDocument(); });
});