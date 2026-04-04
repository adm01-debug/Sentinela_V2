import { useState, useCallback, useEffect } from 'react';

interface FunnelStep { id: string; name: string; count: number; }

export function useFunnelAnalysis(steps: string[]) {
  const [data, setData] = useState<FunnelStep[]>([]);
  const [conversionRates, setConversionRates] = useState<number[]>([]);

  const updateStep = useCallback((stepId: string, count: number) => {
    setData(prev => {
      const updated = [...prev];
      const index = updated.findIndex(s => s.id === stepId);
      if (index >= 0) updated[index].count = count;
      return updated;
    });
  }, []);

  const trackConversion = useCallback((fromStep: string, toStep: string) => {
    const from = data.find(s => s.id === fromStep);
    const to = data.find(s => s.id === toStep);
    if (from && to && from.count > 0) return (to.count / from.count) * 100;
    return 0;
  }, [data]);

  useEffect(() => {
    setData(steps.map((name, i) => ({ id: `step_${i}`, name, count: 0 })));
  }, [steps]);

  useEffect(() => {
    const rates = data.slice(1).map((step, i) => data[i].count > 0 ? (step.count / data[i].count) * 100 : 0);
    setConversionRates(rates);
  }, [data]);

  const overallConversion = data.length >= 2 && data[0].count > 0 ? (data[data.length - 1].count / data[0].count) * 100 : 0;

  return { steps: data, conversionRates, overallConversion, updateStep, trackConversion };
}
export default useFunnelAnalysis;
