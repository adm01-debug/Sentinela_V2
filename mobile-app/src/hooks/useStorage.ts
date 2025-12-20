import { useState, useEffect } from 'react';

export function useStorage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { loading, error };
}
