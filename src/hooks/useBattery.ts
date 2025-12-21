import { useState, useEffect } from 'react';

export function useBattery() {
  const [battery, setBattery] = useState({ level: 1, charging: false });
  useEffect(() => {
    const update = (b: any) => setBattery({ level: b.level, charging: b.charging });
    (navigator as any).getBattery?.().then((b: any) => { update(b); b.addEventListener('levelchange', () => update(b)); b.addEventListener('chargingchange', () => update(b)); });
  }, []);
  return battery;
}