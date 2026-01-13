import { useState, useEffect } from 'react';
export const useHook = (initialValue: any) => {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { /* effect */ }, []);
  return { value, setValue };
};
