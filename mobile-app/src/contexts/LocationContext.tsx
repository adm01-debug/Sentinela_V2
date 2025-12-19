import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const LOCATION_TASK = 'background-location-task';

interface LocationContextType {
  location: Location.LocationObject | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Registrar task de background
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      try {
        // Enviar para o backend
        await supabase.functions.invoke('mobile-collector', {
          body: {
            data_type: 'location',
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: new Date(location.timestamp).toISOString(),
            device_id: Device.modelName,
          },
        });
      } catch (err) {
        console.error('Erro ao enviar localização:', err);
      }
    }
  }
});

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkPermissionsAndStart();
    } else {
      stopTracking();
    }
  }, [isAuthenticated]);

  async function checkPermissionsAndStart() {
    try {
      // Permissão de foreground
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setError('Permissão de localização negada');
        return;
      }

      // Permissão de background
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        setError('Permissão de localização em background negada');
        // Continuar apenas com foreground
      }

      // Obter localização atual
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Iniciar tracking se tiver permissão de background
      if (backgroundStatus === 'granted') {
        await startTracking();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function startTracking() {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
      
      if (!isTaskRegistered) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000, // 1 minuto
          distanceInterval: 100, // 100 metros
          foregroundService: {
            notificationTitle: 'Sentinela',
            notificationBody: 'Monitorando localização',
            notificationColor: '#3b82f6',
          },
          pausesUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
        });
      }
      
      setIsTracking(true);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function stopTracking() {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
      if (isTaskRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK);
      }
      setIsTracking(false);
    } catch (err: any) {
      console.error('Erro ao parar tracking:', err);
    }
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        isTracking,
        error,
        startTracking,
        stopTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
