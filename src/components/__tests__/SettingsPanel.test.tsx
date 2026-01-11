import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from '../SettingsPanel';
describe('SettingsPanel', () => {
  const sections = [{ id: 'general', label: 'General' }, { id: 'security', label: 'Security' }];
  it('renders sections', () => { render(<SettingsPanel sections={sections} activeSection="general" onSectionChange={vi.fn()} />); expect(screen.getByText('General')).toBeInTheDocument(); });
  it('highlights active', () => { render(<SettingsPanel sections={sections} activeSection="general" onSectionChange={vi.fn()} />); expect(screen.getByText('General').closest('button')).toHaveClass('active'); });
  it('changes section', () => { const onChange = vi.fn(); render(<SettingsPanel sections={sections} activeSection="general" onSectionChange={onChange} />); fireEvent.click(screen.getByText('Security')); expect(onChange).toHaveBeenCalledWith('security'); });
});