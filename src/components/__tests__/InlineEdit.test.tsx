import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineEdit } from '../InlineEdit';
describe('InlineEdit', () => {
  it('shows value', () => { render(<InlineEdit value="Test" onSave={vi.fn()} />); expect(screen.getByText('Test')).toBeInTheDocument(); });
  it('edits', () => { render(<InlineEdit value="Test" onSave={vi.fn()} />); fireEvent.click(screen.getByText('Test')); expect(screen.getByRole('textbox')).toBeInTheDocument(); });
});