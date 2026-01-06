import { useState, useCallback, useMemo } from 'react';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

export interface UseMultiStepWizardOptions {
  steps: WizardStep[];
  initialStep?: number;
  onComplete?: () => void;
  onStepChange?: (step: number, direction: 'forward' | 'backward') => void;
}

export function useMultiStepWizard(options: UseMultiStepWizardOptions) {
  const { steps, initialStep = 0, onComplete, onStepChange } = options;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  const currentStepData = useMemo(() => steps[currentStep], [steps, currentStep]);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      const direction = stepIndex > currentStep ? 'forward' : 'backward';
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex, direction);
    }
  }, [steps.length, currentStep, onStepChange]);

  const nextStep = useCallback(async () => {
    const step = steps[currentStep];
    if (step.validate) {
      setIsValidating(true);
      const isValid = await step.validate();
      setIsValidating(false);
      if (!isValid) return false;
    }
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (isLastStep) { onComplete?.(); return true; }
    goToStep(currentStep + 1);
    return true;
  }, [currentStep, steps, isLastStep, onComplete, goToStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) goToStep(currentStep - 1);
  }, [isFirstStep, currentStep, goToStep]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
  }, [initialStep]);

  const isStepCompleted = useCallback((index: number) => completedSteps.has(index), [completedSteps]);

  return {
    currentStep, currentStepData, steps, isFirstStep, isLastStep, progress, isValidating,
    nextStep, prevStep, goToStep, reset, isStepCompleted, completedSteps: Array.from(completedSteps)
  };
}

export default useMultiStepWizard;
