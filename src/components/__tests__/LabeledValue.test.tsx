import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LabeledValue } from '../LabeledValue';
describe('LabeledValue', () => {
  it('label', () => { render(<LabeledValue label="Status" value="Active" />); expect(screen.getByText('Status')).toBeInTheDocument(); });
  it('value', () => { render(<LabeledValue label="Status" value="Active" />); expect(screen.getByText('Active')).toBeInTheDocument(); });
});