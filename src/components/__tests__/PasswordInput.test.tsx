import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../PasswordInput';
describe('PasswordInput', () => {
  it('renders hidden', () => { render(<PasswordInput value="secret" onChange={vi.fn()} />); expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password'); });
  it('toggles visibility', () => { render(<PasswordInput value="secret" onChange={vi.fn()} />); fireEvent.click(screen.getByRole('button')); expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text'); });
});