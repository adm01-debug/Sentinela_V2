import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from '../CategoryFilter';
describe('CategoryFilter', () => {
  const categories = [{ id: '1', name: 'Work', count: 45 }, { id: '2', name: 'Personal', count: 12 }];
  it('renders', () => { render(<CategoryFilter categories={categories} selected={[]} onChange={vi.fn()} />); expect(screen.getByText('Work')).toBeInTheDocument(); });
  it('shows count', () => { render(<CategoryFilter categories={categories} selected={[]} onChange={vi.fn()} />); expect(screen.getByText('45')).toBeInTheDocument(); });
  it('selects category', () => { const onChange = vi.fn(); render(<CategoryFilter categories={categories} selected={[]} onChange={onChange} />); fireEvent.click(screen.getByText('Work')); expect(onChange).toHaveBeenCalledWith(['1']); });
});