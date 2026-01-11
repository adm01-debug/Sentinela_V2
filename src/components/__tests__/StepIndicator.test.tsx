import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepIndicator } from '../StepIndicator';
describe('StepIndicator', () => {
  const steps = ['Step 1', 'Step 2', 'Step 3'];
  it('renders steps', () => { render(<StepIndicator steps={steps} currentStep={0} />); expect(screen.getByText('Step 1')).toBeInTheDocument(); });
  it('highlights current', () => { render(<StepIndicator steps={steps} currentStep={1} />); expect(screen.getByText('Step 2').closest('div')).toHaveClass('active'); });
  it('marks completed', () => { render(<StepIndicator steps={steps} currentStep={2} />); expect(screen.getByText('Step 1').closest('div')).toHaveClass('completed'); });
});