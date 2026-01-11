import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingWizard } from '../OnboardingWizard';
describe('OnboardingWizard', () => {
  const steps = [{ title: 'Welcome', content: 'Welcome!' }, { title: 'Setup', content: 'Configure settings' }];
  it('renders wizard', () => { render(<OnboardingWizard steps={steps} onComplete={vi.fn()} />); expect(screen.getByText('Welcome')).toBeInTheDocument(); });
  it('shows step indicator', () => { render(<OnboardingWizard steps={steps} onComplete={vi.fn()} />); expect(screen.getByText('Step 1 of 2')).toBeInTheDocument(); });
  it('navigates to next step', () => { render(<OnboardingWizard steps={steps} onComplete={vi.fn()} />); fireEvent.click(screen.getByText(/next/i)); expect(screen.getByText('Setup')).toBeInTheDocument(); });
  it('completes wizard', () => { const onComplete = vi.fn(); render(<OnboardingWizard steps={steps} onComplete={onComplete} currentStep={1} />); fireEvent.click(screen.getByText(/finish/i)); expect(onComplete).toHaveBeenCalled(); });
});