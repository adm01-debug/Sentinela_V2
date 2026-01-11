import { useState, useEffect } from 'react';
import { assignVariant } from '@/lib/analytics/ab-testing';

export function useExperiment(experimentId: string, variants: string[], userId: string) {
  const [variant, setVariant] = useState<string>('');
  
  useEffect(() => {
    const assigned = assignVariant({ id: experimentId, name: experimentId, variants }, userId);
    setVariant(assigned);
  }, [experimentId, variants, userId]);
  
  return { variant, isVariant: (v: string) => variant === v };
}
