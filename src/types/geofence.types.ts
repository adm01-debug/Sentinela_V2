export interface Geofence { id: string; name: string; description?: string; type: GeofenceType; coordinates: Coordinates; radius?: number; polygon?: Coordinates[]; isActive: boolean; alertOnEntry: boolean; alertOnExit: boolean; teams?: string[]; createdAt: string; updatedAt: string; }
export type GeofenceType = 'circle' | 'polygon' | 'rectangle';
export interface Coordinates { lat: number; lng: number; }
export interface GeofenceEvent { id: string; geofenceId: string; employeeId: string; type: 'entry' | 'exit'; location: Coordinates; timestamp: string; }
export interface GeofenceAlert { id: string; geofenceId: string; employeeId: string; type: 'entry' | 'exit'; geofenceName: string; employeeName: string; timestamp: string; acknowledged: boolean; }
export interface GeofenceStats { totalGeofences: number; activeGeofences: number; todayEvents: number; alertsTriggered: number; }
