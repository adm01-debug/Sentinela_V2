import { useState, useCallback } from "react";
interface GeoState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}
export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });
  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        }),
      (err) => setState((s) => ({ ...s, error: err.message, loading: false })),
      options
    );
  }, [options]);
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return null;
    return navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        }),
      (err) => setState((s) => ({ ...s, error: err.message, loading: false })),
      options
    );
  }, [options]);
  return { ...state, getPosition, watchPosition };
}
export default useGeolocation;
