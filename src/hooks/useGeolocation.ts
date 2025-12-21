import { useState, useEffect } from 'react';

interface Position { lat: number; lng: number; accuracy: number; }

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }); setLoading(false); },
      err => { setError(err.message); setLoading(false); }
    );
  }, []);

  return { position, error, loading };
}