import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
export const useEmployee = (id) => {
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const [emp, st] = await Promise.all([apiClient.get('/employees/' + id), apiClient.get('/employees/' + id + '/stats')]);
        setEmployee(emp); setStats(st);
      } finally { setIsLoading(false); }
    };
    fetch();
  }, [id]);
  return { employee, stats, isLoading };
};