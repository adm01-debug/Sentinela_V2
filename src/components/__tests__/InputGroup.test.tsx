import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputGroup } from '../InputGroup';
describe('InputGroup', () => {
  it('renders', () => { render(<InputGroup><input /></InputGroup>); expect(screen.getByRole('textbox')).toBeInTheDocument(); });
  it('prefix', () => { render(<InputGroup prefix="$"><input /></InputGroup>); expect(screen.getByText('$')).toBeInTheDocument(); });
});