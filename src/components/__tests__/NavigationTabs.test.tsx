import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationTabs } from '../NavigationTabs';
describe('NavigationTabs', () => {
  const tabs = [{ id: '1', label: 'Tab 1' }, { id: '2', label: 'Tab 2' }];
  it('renders', () => { render(<NavigationTabs tabs={tabs} active="1" onChange={vi.fn()} />); expect(screen.getByText('Tab 1')).toBeInTheDocument(); });
  it('switches', () => { const fn = vi.fn(); render(<NavigationTabs tabs={tabs} active="1" onChange={fn} />); fireEvent.click(screen.getByText('Tab 2')); expect(fn).toHaveBeenCalledWith('2'); });
});