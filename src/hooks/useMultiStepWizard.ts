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
  onStepChange?: (step, direction: 'next' | 'prev') => void;
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

  const goToStep = useCallback((step) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

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
    setCurrentStep(prev => prev + 1);
    onStepChange?.(currentStep + 1, 'next');
    return true;
  }, [currentStep, steps, isLastStep, onComplete, onStepChange]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      onStepChange?.(currentStep - 1, 'prev');
    }
  }, [isFirstStep, currentStep, onStepChange]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
  }, [initialStep]);

  const isStepCompleted = useCallback((step) => completedSteps.has(step), [completedSteps]);

  return { currentStep, currentStepData, steps, isFirstStep, isLastStep, progress, isValidating, goToStep, nextStep, prevStep, reset, isStepCompleted, completedSteps: Array.from(completedSteps) };
}

export default useMultiStepWizard;
