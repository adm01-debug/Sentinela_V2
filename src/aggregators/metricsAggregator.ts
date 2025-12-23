export const metricsAggregator = {
  aggregate: (metrics: { name: string; value: number }[]) => metrics.reduce((acc, m) => { acc[m.name] = (acc[m.name] || 0) + m.value; return acc; }, {} as Record<string, number>),
  average: (metrics: { name: string; value: number }[]) => { const groups = metrics.reduce((acc, m) => { acc[m.name] = acc[m.name] || []; acc[m.name].push(m.value); return acc; }, {} as Record<string, number[]>); return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.reduce((a, b) => a + b, 0) / v.length])); },
  trends: (metrics: { date: string; value: number }[]) => { const sorted = [...metrics].sort((a, b) => a.date.localeCompare(b.date)); return sorted.map((m, i) => ({ ...m, change: i > 0 ? m.value - sorted[i - 1].value : 0 })); },
};
