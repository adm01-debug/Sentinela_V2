import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
export interface LocationTrackerProps { onLocationUpdate: (location: { lat: number; lng: number }) => void; interval?: number; }
export const LocationTracker: React.FC<LocationTrackerProps> = ({ onLocationUpdate, interval = 60000 }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => { /* Start location tracking */ }, [interval]);
  return location ? <Text>Location: {location.lat}, {location.lng}</Text> : null;
};
export default LocationTracker;
