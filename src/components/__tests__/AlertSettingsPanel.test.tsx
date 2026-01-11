import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertSettingsPanel } from '../AlertSettingsPanel';

describe('AlertSettingsPanel', () => {
  const mockSettings = { emailEnabled: true, slackEnabled: false, threshold: 80 };
  it('renders settings form', () => {
    render(<AlertSettingsPanel settings={mockSettings} onSave={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeChecked();
    expect(screen.getByLabelText(/slack/i)).not.toBeChecked();
  });
  it('updates settings on change', () => {
    render(<AlertSettingsPanel settings={mockSettings} onSave={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/slack/i));
    expect(screen.getByLabelText(/slack/i)).toBeChecked();
  });
  it('saves settings', () => {
    const onSave = vi.fn();
    render(<AlertSettingsPanel settings={mockSettings} onSave={onSave} />);
    fireEvent.click(screen.getByText(/save/i));
    expect(onSave).toHaveBeenCalled();
  });
  it('validates threshold range', () => {
    render(<AlertSettingsPanel settings={mockSettings} onSave={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/threshold/i), { target: { value: '150' } });
    expect(screen.getByText(/must be between/i)).toBeInTheDocument();
  });
});