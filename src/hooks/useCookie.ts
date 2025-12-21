import { useState, useCallback } from 'react';

export function useCookie(name: string) {
  const getCookie = () => document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1];
  const [value, setValue] = useState(getCookie);
  const set = useCallback((val: string, days = 7) => { document.cookie = `${name}=${val};max-age=${days*86400};path=/`; setValue(val); }, [name]);
  const remove = useCallback(() => { document.cookie = `${name}=;max-age=0;path=/`; setValue(undefined); }, [name]);
  return { value, set, remove };
}