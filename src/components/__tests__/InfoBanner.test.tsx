import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoBanner } from '../InfoBanner';
describe('InfoBanner', () => {
  it('renders', () => { render(<InfoBanner message="Info" />); expect(screen.getByText('Info')).toBeInTheDocument(); });
  it('dismiss', () => { const fn = vi.fn(); render(<InfoBanner message="Info" dismissible onDismiss={fn} />); fireEvent.click(screen.getByRole('button')); expect(fn).toHaveBeenCalled(); });
});