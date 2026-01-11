import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Placeholder } from '../Placeholder';
describe('Placeholder', () => {
  it('renders text', () => { render(<Placeholder text="Coming soon" />); expect(screen.getByText('Coming soon')).toBeInTheDocument(); });
  it('renders icon', () => { render(<Placeholder icon="construction" text="WIP" />); expect(screen.getByTestId('icon-construction')).toBeInTheDocument(); });
});