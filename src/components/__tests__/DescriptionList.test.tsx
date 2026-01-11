import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DescriptionList } from '../DescriptionList';
describe('DescriptionList', () => {
  const items = [{ label: 'Name', value: 'John' }, { label: 'Email', value: 'john@test.com' }];
  it('renders items', () => { render(<DescriptionList items={items} />); expect(screen.getByText('Name')).toBeInTheDocument(); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('horizontal layout', () => { const { container } = render(<DescriptionList items={items} layout="horizontal" />); expect(container.firstChild).toHaveClass('flex-row'); });
});