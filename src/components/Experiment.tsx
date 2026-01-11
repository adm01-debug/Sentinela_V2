import React from 'react';
import { useExperiment } from '@/hooks/useExperiment';

interface Props { experimentId: string; variants: Record<string, React.ReactNode>; userId: string; }

export function Experiment({ experimentId, variants, userId }: Props) {
  const { variant } = useExperiment(experimentId, Object.keys(variants), userId);
  return <>{variants[variant] || null}</>;
}
