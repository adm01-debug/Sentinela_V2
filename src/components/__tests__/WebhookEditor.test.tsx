import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebhookEditor } from '../WebhookEditor';
describe('WebhookEditor', () => {
  const webhook = { id: '1', url: 'https://example.com/hook', events: ['employee.created'], active: true };
  it('renders', () => { render(<WebhookEditor webhook={webhook} onSave={vi.fn()} />); expect(screen.getByDisplayValue('https://example.com/hook')).toBeInTheDocument(); });
  it('edits URL', () => { render(<WebhookEditor webhook={webhook} onSave={vi.fn()} />); fireEvent.change(screen.getByLabelText(/url/i), { target: { value: 'https://new.com' } }); expect(screen.getByDisplayValue('https://new.com')).toBeInTheDocument(); });
  it('saves', () => { const onSave = vi.fn(); render(<WebhookEditor webhook={webhook} onSave={onSave} />); fireEvent.click(screen.getByText(/save/i)); expect(onSave).toHaveBeenCalled(); });
});