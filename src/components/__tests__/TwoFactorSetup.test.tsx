import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TwoFactorSetup } from '../TwoFactorSetup';
describe('TwoFactorSetup', () => {
  it('renders', () => { render(<TwoFactorSetup onComplete={vi.fn()} />); expect(screen.getByText(/two-factor/i)).toBeInTheDocument(); });
  it('shows QR code', () => { render(<TwoFactorSetup qrCode="data:image/png;base64,..." onComplete={vi.fn()} />); expect(screen.getByRole('img')).toBeInTheDocument(); });
  it('verifies code', () => { const onComplete = vi.fn(); render(<TwoFactorSetup onComplete={onComplete} />); fireEvent.change(screen.getByLabelText(/code/i), { target: { value: '123456' } }); fireEvent.click(screen.getByText(/verify/i)); expect(onComplete).toHaveBeenCalled(); });
});