import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
describe('LanguageSelector', () => {
  const languages = [{ code: 'en', label: 'English' }, { code: 'pt', label: 'Português' }];
  it('renders selector', () => { render(<LanguageSelector languages={languages} current="en" onChange={vi.fn()} />); expect(screen.getByRole('combobox')).toBeInTheDocument(); });
  it('shows current language', () => { render(<LanguageSelector languages={languages} current="en" onChange={vi.fn()} />); expect(screen.getByText('English')).toBeInTheDocument(); });
  it('changes language', () => { const onChange = vi.fn(); render(<LanguageSelector languages={languages} current="en" onChange={onChange} />); fireEvent.click(screen.getByRole('combobox')); fireEvent.click(screen.getByText('Português')); expect(onChange).toHaveBeenCalledWith('pt'); });
});