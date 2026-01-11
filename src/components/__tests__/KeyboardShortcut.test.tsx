import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardShortcut } from '../KeyboardShortcut';
describe('KeyboardShortcut', () => {
  it('renders', () => { render(<KeyboardShortcut keys={['Ctrl', 'K']} />); expect(screen.getByText('Ctrl')).toBeInTheDocument(); });
});