export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: 'polygon' | 'circle';
  center_lat?: number;
  center_lng?: number;
  radius?: number; // meters
  geometry?: GeoJSON;
  color: string;
  is_active: boolean;
  restricted: boolean;
  required: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeoJSON {
  type: 'polygon';
  coordinates: number[][]; // [lng, lat] pairs
}

export interface GeofenceEvent {
  id: string;
  employee_id: string;
  geofence_id: string;
  event_type: 'enter' | 'exit';
  location: {
    lat: number;
    lng: number;
  };
  occurred_at: string;
}

export interface GeofenceState {
  employee_id: string;
  device_id: string;
  geofence_id: string;
  is_inside: boolean;
  last_checked: string;
}

export interface GeofenceFormData {
  name: string;
  description?: string;
  type: 'polygon' | 'circle';
  center_lat?: number;
  center_lng?: number;
  radius?: number;
  color: string;
  is_active: boolean;
  restricted: boolean;
  required: boolean;
}
