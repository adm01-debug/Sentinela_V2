import { useState, useCallback } from "react";

export function useStepper(totalSteps: any, initialStep = 0) {
  const [step, setStep] = useState(initialStep);

  const next = useCallback(() => setStep(s => Math.min(s + 1, totalSteps - 1)), [totalSteps]);
  const prev = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const goTo = useCallback((s) => setStep(Math.max(0, Math.min(s, totalSteps - 1))), [totalSteps]);
  const reset = useCallback(() => setStep(initialStep), [initialStep]);

  return {
    step,
    next,
    prev,
    goTo,
    reset,
    isFirst: step === 0,
    isLast: step === totalSteps - 1,
    progress: (step + 1) / totalSteps
  };
}
