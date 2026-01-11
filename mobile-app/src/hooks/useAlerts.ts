import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
export const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetch = useCallback(async () => {
    try { setIsLoading(true); const data = await apiClient.get('/alerts'); setAlerts(data); }
    catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, []);
  const acknowledgeAlert = async (id) => {
    await apiClient.post('/alerts/' + id + '/acknowledge');
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };
  useEffect(() => { fetch(); }, [fetch]);
  return { alerts, isLoading, acknowledgeAlert, refetch: fetch };
};