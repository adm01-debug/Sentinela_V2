import { useState, useCallback, useEffect } from 'react';

interface CohortData { cohort: string; periods: number[]; }

export function useCohortAnalysis() {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [retentionMatrix, setRetentionMatrix] = useState<number[][]>([]);

  const addCohort = useCallback((cohortName: string, initialSize: number) => {
    setCohorts(prev => [...prev, { cohort: cohortName, periods: [initialSize] }]);
  }, []);

  const updatePeriod = useCallback((cohortName: string, periodIndex: number, activeUsers: number) => {
    setCohorts(prev => prev.map(c => {
      if (c.cohort !== cohortName) return c;
      const periods = [...c.periods];
      periods[periodIndex] = activeUsers;
      return { ...c, periods };
    }));
  }, []);

  useEffect(() => {
    const matrix = cohorts.map(c => c.periods.map((p, i) => i === 0 ? 100 : c.periods[0] > 0 ? (p / c.periods[0]) * 100 : 0));
    setRetentionMatrix(matrix);
  }, [cohorts]);

  const getAverageRetention = useCallback((periodIndex: number) => {
    const values = retentionMatrix.map(row => row[periodIndex]).filter(v => v !== undefined);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }, [retentionMatrix]);

  return { cohorts, retentionMatrix, addCohort, updatePeriod, getAverageRetention };
}
export default useCohortAnalysis;
