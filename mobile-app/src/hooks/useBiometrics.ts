import { useState, useEffect, useCallback } from 'react';
import { isBiometricsAvailable, authenticate } from '@/services/biometrics';

export function useBiometrics() {
  const [available, setAvailable] = useState(false);
  
  useEffect(() => {
    isBiometricsAvailable().then(setAvailable);
  }, []);
  
  const auth = useCallback(() => authenticate(), []);
  
  return { available, authenticate: auth };
}
