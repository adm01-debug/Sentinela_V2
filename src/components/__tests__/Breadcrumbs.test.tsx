import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../Breadcrumbs';
import { BrowserRouter } from 'react-router-dom';
const wrap = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
describe('Breadcrumbs', () => {
  const items = [{ label: 'Home', href: '/' }, { label: 'Users', href: '/users' }, { label: 'John' }];
  it('renders breadcrumb items', () => { wrap(<Breadcrumbs items={items} />); expect(screen.getByText('Home')).toBeInTheDocument(); });
  it('last item is not a link', () => { wrap(<Breadcrumbs items={items} />); expect(screen.getByText('John').closest('a')).toBeNull(); });
  it('shows separator', () => { wrap(<Breadcrumbs items={items} separator=">" />); expect(screen.getAllByText('>')).toHaveLength(2); });
});