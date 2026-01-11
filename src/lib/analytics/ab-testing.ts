interface Experiment { id: string; name: string; variants: string[]; weights?: number[]; }

const experiments = new Map<string, string>();

export function assignVariant(experiment: Experiment, userId: string): string {
  const key = `${experiment.id}:${userId}`;
  if (experiments.has(key)) return experiments.get(key)!;
  
  const weights = experiment.weights || experiment.variants.map(() => 1 / experiment.variants.length);
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      experiments.set(key, experiment.variants[i]);
      return experiment.variants[i];
    }
  }
  
  return experiment.variants[0];
}

export function getVariant(experimentId: string, userId: string): string | undefined {
  return experiments.get(`${experimentId}:${userId}`);
}
