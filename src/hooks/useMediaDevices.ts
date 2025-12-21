import { useState, useEffect } from 'react';
export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => { navigator.mediaDevices?.enumerateDevices().then(setDevices); }, []);
  return devices;
}