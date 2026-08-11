import { useState, useEffect } from 'react';

export function useDeviceMotion() {
  const [motion, setMotion] = useState({ x: 0, y: 0, z: 0 });
  useEffect(() => {
    const handler = (e: DeviceMotionEvent) => { const a = e.accelerationIncludingGravity; if (a) setMotion({ x: a.x || 0, y: a.y || 0, z: a.z || 0 }); };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, []);
  return motion;
}