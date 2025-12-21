import { useState, useEffect } from 'react';
export function usePermission(name: PermissionName) {
  const [state, setState] = useState<PermissionState>('prompt');
  useEffect(() => { navigator.permissions?.query({ name }).then(p => { setState(p.state); p.onchange = () => setState(p.state); }); }, [name]);
  return state;
}