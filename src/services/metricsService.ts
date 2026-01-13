const metrics: Record<string, number[]> = {};
export const metricsService = {
  record: (name: string, value: number) => { if (!metrics[name]) metrics[name] = []; metrics[name].push(value); },
  get: (name: string) => metrics[name] || [],
  avg: (name: string) => { const m = metrics[name]; return m ? m.reduce((a,b) => a+b, 0) / m.length : 0; },
  clear: () => Object.keys(metrics).forEach(k => delete metrics[k]),
};
