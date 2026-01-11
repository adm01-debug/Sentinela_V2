import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpTooltip } from '../HelpTooltip';
describe('HelpTooltip', () => {
  it('renders icon', () => { render(<HelpTooltip content="Help" />); expect(screen.getByTestId('help-icon')).toBeInTheDocument(); });
  it('shows on hover', async () => { render(<HelpTooltip content="Help" />); fireEvent.mouseEnter(screen.getByTestId('help-icon')); expect(await screen.findByText('Help')).toBeInTheDocument(); });
});