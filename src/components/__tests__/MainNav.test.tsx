import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainNav } from '../MainNav';
import { BrowserRouter } from 'react-router-dom';
const wrap = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
describe('MainNav', () => {
  const items = [{ label: 'Dashboard', href: '/' }, { label: 'Employees', href: '/employees' }];
  it('renders nav items', () => { wrap(<MainNav items={items} />); expect(screen.getByText('Dashboard')).toBeInTheDocument(); });
  it('highlights active item', () => { wrap(<MainNav items={items} activeItem="/" />); expect(screen.getByText('Dashboard').closest('a')).toHaveClass('active'); });
  it('shows icons', () => { wrap(<MainNav items={[{ ...items[0], icon: 'home' }]} />); expect(screen.getByTestId('icon-home')).toBeInTheDocument(); });
});