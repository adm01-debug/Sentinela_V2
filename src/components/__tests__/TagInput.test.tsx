import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../TagInput';
describe('TagInput', () => {
  it('renders tags', () => { render(<TagInput tags={['tag1', 'tag2']} onChange={vi.fn()} />); expect(screen.getByText('tag1')).toBeInTheDocument(); });
  it('adds tag', () => { const onChange = vi.fn(); render(<TagInput tags={[]} onChange={onChange} />); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } }); fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' }); expect(onChange).toHaveBeenCalledWith(['new']); });
  it('removes tag', () => { const onChange = vi.fn(); render(<TagInput tags={['tag1']} onChange={onChange} />); fireEvent.click(screen.getByRole('button', { name: /remove tag1/i })); expect(onChange).toHaveBeenCalledWith([]); });
});