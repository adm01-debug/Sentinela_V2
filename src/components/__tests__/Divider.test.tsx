import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from '../Divider';
describe('Divider', () => {
  it('renders', () => { render(<Divider />); expect(screen.getByRole('separator')).toBeInTheDocument(); });
  it('with text', () => { render(<Divider text="OR" />); expect(screen.getByText('OR')).toBeInTheDocument(); });
  it('vertical', () => { const { container } = render(<Divider orientation="vertical" />); expect(container.firstChild).toHaveClass('vertical'); });
});