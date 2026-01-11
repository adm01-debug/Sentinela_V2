import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
export const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    try { setIsLoading(true); const data = await apiClient.get('/activities'); setActivities(data); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { fetch(); }, [fetch]);
  return { activities, isLoading, error, refetch: fetch };
};