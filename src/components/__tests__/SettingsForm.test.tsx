import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsForm } from '../SettingsForm';
describe('SettingsForm', () => {
  const settings = { theme: 'dark', language: 'en', notifications: true };
  it('renders', () => { render(<SettingsForm settings={settings} onSave={vi.fn()} />); expect(screen.getByLabelText(/theme/i)).toBeInTheDocument(); });
  it('updates setting', () => { render(<SettingsForm settings={settings} onSave={vi.fn()} />); fireEvent.click(screen.getByLabelText(/notifications/i)); expect(screen.getByLabelText(/notifications/i)).not.toBeChecked(); });
  it('saves', () => { const onSave = vi.fn(); render(<SettingsForm settings={settings} onSave={onSave} />); fireEvent.click(screen.getByText(/save/i)); expect(onSave).toHaveBeenCalled(); });
});