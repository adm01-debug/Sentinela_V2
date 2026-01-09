import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Stepper, Step } from '../Stepper';

describe('Stepper', () => {
  it('renders steps', () => {
    render(
      <Stepper currentStep={0}>
        <Step title="Step 1" />
        <Step title="Step 2" />
      </Stepper>
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('marks current step as active', () => {
    render(
      <Stepper currentStep={1}>
        <Step title="Step 1" />
        <Step title="Step 2" />
      </Stepper>
    );
    expect(screen.getByText('Step 2').closest('div')).toHaveClass('active');
  });

  it('marks completed steps', () => {
    render(
      <Stepper currentStep={1}>
        <Step title="Done" />
        <Step title="Current" />
      </Stepper>
    );
    expect(screen.getByText('Done').closest('div')).toHaveClass('completed');
  });
});