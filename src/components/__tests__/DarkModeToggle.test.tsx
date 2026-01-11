import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DarkModeToggle } from '../DarkModeToggle';
describe('DarkModeToggle', () => {
  it('renders toggle', () => { render(<DarkModeToggle isDark={false} onToggle={vi.fn()} />); expect(screen.getByRole('button')).toBeInTheDocument(); });
  it('shows sun icon when dark', () => { render(<DarkModeToggle isDark={true} onToggle={vi.fn()} />); expect(screen.getByTestId('sun-icon')).toBeInTheDocument(); });
  it('shows moon icon when light', () => { render(<DarkModeToggle isDark={false} onToggle={vi.fn()} />); expect(screen.getByTestId('moon-icon')).toBeInTheDocument(); });
  it('calls onToggle', () => { const onToggle = vi.fn(); render(<DarkModeToggle isDark={false} onToggle={onToggle} />); fireEvent.click(screen.getByRole('button')); expect(onToggle).toHaveBeenCalled(); });
});