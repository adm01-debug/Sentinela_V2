import { useState, useCallback } from 'react';

export function useStep(maxStep: number, initialStep = 0) {
  const [step, setStep] = useState(initialStep);

  const next = useCallback(() => setStep(s => Math.min(s + 1, maxStep)), [maxStep]);
  const prev = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const goTo = useCallback((s: number) => setStep(Math.max(0, Math.min(s, maxStep))), [maxStep]);
  const reset = useCallback(() => setStep(initialStep), [initialStep]);

  return { step, next, prev, goTo, reset, isFirst: step === 0, isLast: step === maxStep };
}