import { create } from 'zustand';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: 'circle' | 'polygon';
  center?: Coordinates;
  radius?: number;
  points?: Coordinates[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GeofenceState {
  geofences: Geofence[];
  selectedGeofence: Geofence | null;
  loading: boolean;
  error: string | null;
}

interface GeofenceActions {
  setGeofences: (geofences: Geofence[]) => void;
  addGeofence: (geofence: Geofence) => void;
  updateGeofence: (id: string, updates: Partial<Geofence>) => void;
  removeGeofence: (id: string) => void;
  setSelectedGeofence: (geofence: Geofence | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type GeofenceStore = GeofenceState & GeofenceActions;

const initialState: GeofenceState = {
  geofences: [],
  selectedGeofence: null,
  loading: false,
  error: null,
};

export const useGeofenceStore = create<GeofenceStore>((set) => ({
  ...initialState,

  setGeofences: (geofences) => set({ geofences, error: null }),

  addGeofence: (geofence) =>
    set((state) => ({
      geofences: [...state.geofences, geofence],
    })),

  updateGeofence: (id, updates) =>
    set((state) => ({
      geofences: state.geofences.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),

  removeGeofence: (id) =>
    set((state) => ({
      geofences: state.geofences.filter((g) => g.id !== id),
    })),

  setSelectedGeofence: (selectedGeofence) => set({ selectedGeofence }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export type { Geofence, Coordinates, GeofenceState };
