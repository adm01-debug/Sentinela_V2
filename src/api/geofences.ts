import { api } from './client';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

interface GeofenceData {
  name: string;
  description?: string;
  type: 'circle' | 'polygon';
  coordinates: number[][] | { lat: number; lng: number; radius: number };
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

interface EventParams {
  startDate?: string;
  endDate?: string;
  type?: 'enter' | 'exit' | 'dwell';
  page?: number;
  limit?: number;
}

export const geofencesApi = {
  list: (params?: ListParams) => api.get('/geofences', { params }),
  get: (id: string) => api.get(`/geofences/${id}`),
  create: (data: GeofenceData) => api.post('/geofences', data),
  update: (id: string, data: Partial<GeofenceData>) => api.patch(`/geofences/${id}`, data),
  delete: (id: string) => api.delete(`/geofences/${id}`),
  events: (id: string, params?: EventParams) => api.get(`/geofences/${id}/events`, { params }),
};

export type { ListParams, GeofenceData, EventParams };
