import { useState, useCallback } from "react";

interface Step { id: string; label: string; completed: boolean; }

export function useSteps(labels: string[]) {
  const [steps, setSteps] = useState<Step[]>(() =>
    labels.map((label, i) => ({ id: String(i), label, completed: false }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const complete = useCallback((index: number) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, completed: true } : s));
    if (index < steps.length - 1) setCurrentIndex(index + 1);
  }, [steps.length]);

  const goTo = useCallback((index: number) => setCurrentIndex(index), []);

  return { steps, currentIndex, currentStep: steps[currentIndex], complete, goTo };
}
