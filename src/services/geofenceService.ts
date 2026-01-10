import { supabase } from '@/integrations/supabase/client';

export type GeofenceType = 'circle' | 'polygon' | 'rectangle';
export type GeofenceAction = 'enter' | 'exit' | 'dwell';

export interface GeofenceCoordinates {
  latitude: number;
  longitude: number;
}

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: GeofenceType;
  coordinates: GeofenceCoordinates;
  radius?: number; // For circle type
  polygon_points?: GeofenceCoordinates[]; // For polygon type
  is_active: boolean;
  color?: string;
  alert_on_enter: boolean;
  alert_on_exit: boolean;
  alert_on_dwell: boolean;
  dwell_time_minutes?: number;
  allowed_employees?: string[];
  restricted_employees?: string[];
  schedule?: {
    days: number[];
    start_time: string;
    end_time: string;
  };
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface GeofenceEvent {
  id: string;
  geofence_id: string;
  employee_id: string;
  device_id: string;
  action: GeofenceAction;
  coordinates: GeofenceCoordinates;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GeofenceCreateData {
  name: string;
  description?: string;
  type: GeofenceType;
  coordinates: GeofenceCoordinates;
  radius?: number;
  polygon_points?: GeofenceCoordinates[];
  color?: string;
  alert_on_enter?: boolean;
  alert_on_exit?: boolean;
  alert_on_dwell?: boolean;
  dwell_time_minutes?: number;
  allowed_employees?: string[];
  restricted_employees?: string[];
  schedule?: Geofence['schedule'];
  organization_id: string;
}

export const geofenceService = {
  /**
   * Get all geofences for an organization
   */
  async getAll(organizationId: string): Promise<Geofence[]> {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');

    if (error) throw error;
    return (data as Geofence[]) || [];
  },

  /**
   * Get active geofences
   */
  async getActive(organizationId: string): Promise<Geofence[]> {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data as Geofence[]) || [];
  },

  /**
   * Get geofence by ID
   */
  async getById(id: string): Promise<Geofence | null> {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Geofence;
  },

  /**
   * Create a geofence
   */
  async create(geofence: GeofenceCreateData): Promise<Geofence> {
    const { data, error } = await supabase
      .from('geofences')
      .insert([{
        ...geofence,
        is_active: true,
        alert_on_enter: geofence.alert_on_enter ?? true,
        alert_on_exit: geofence.alert_on_exit ?? true,
        alert_on_dwell: geofence.alert_on_dwell ?? false,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Geofence;
  },

  /**
   * Update a geofence
   */
  async update(id: string, updates: Partial<Geofence>): Promise<Geofence> {
    const { data, error } = await supabase
      .from('geofences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Geofence;
  },

  /**
   * Delete a geofence
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('geofences')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Toggle geofence active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<Geofence> {
    return this.update(id, { is_active: isActive });
  },

  /**
   * Get geofence events
   */
  async getEvents(
    geofenceId: string,
    options: { limit?: number; dateFrom?: string; dateTo?: string } = {}
  ): Promise<GeofenceEvent[]> {
    const { limit = 100, dateFrom, dateTo } = options;

    let query = supabase
      .from('geofence_events')
      .select('*')
      .eq('geofence_id', geofenceId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (dateFrom) query = query.gte('timestamp', dateFrom);
    if (dateTo) query = query.lte('timestamp', dateTo);

    const { data, error } = await query;
    if (error) throw error;
    return (data as GeofenceEvent[]) || [];
  },

  /**
   * Record a geofence event
   */
  async recordEvent(event: Omit<GeofenceEvent, 'id'>): Promise<GeofenceEvent> {
    const { data, error } = await supabase
      .from('geofence_events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data as GeofenceEvent;
  },

  /**
   * Check if a point is inside a geofence
   */
  isPointInGeofence(point: GeofenceCoordinates, geofence: Geofence): boolean {
    switch (geofence.type) {
      case 'circle':
        return this.isPointInCircle(point, geofence.coordinates, geofence.radius || 0);
      case 'polygon':
        return this.isPointInPolygon(point, geofence.polygon_points || []);
      case 'rectangle':
        return this.isPointInRectangle(point, geofence.polygon_points || []);
      default:
        return false;
    }
  },

  /**
   * Check if point is within a circle
   */
  isPointInCircle(point: GeofenceCoordinates, center: GeofenceCoordinates, radius: number): boolean {
    const distance = this.calculateDistance(point, center);
    return distance <= radius;
  },

  /**
   * Check if point is within a polygon using ray casting algorithm
   */
  isPointInPolygon(point: GeofenceCoordinates, polygon: GeofenceCoordinates[]): boolean {
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].longitude;
      const yi = polygon[i].latitude;
      const xj = polygon[j].longitude;
      const yj = polygon[j].latitude;

      const intersect =
        yi > point.latitude !== yj > point.latitude &&
        point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  },

  /**
   * Check if point is within a rectangle
   */
  isPointInRectangle(point: GeofenceCoordinates, corners: GeofenceCoordinates[]): boolean {
    if (corners.length < 2) return false;
    
    const minLat = Math.min(corners[0].latitude, corners[1].latitude);
    const maxLat = Math.max(corners[0].latitude, corners[1].latitude);
    const minLng = Math.min(corners[0].longitude, corners[1].longitude);
    const maxLng = Math.max(corners[0].longitude, corners[1].longitude);

    return (
      point.latitude >= minLat &&
      point.latitude <= maxLat &&
      point.longitude >= minLng &&
      point.longitude <= maxLng
    );
  },

  /**
   * Calculate distance between two points in meters (Haversine formula)
   */
  calculateDistance(point1: GeofenceCoordinates, point2: GeofenceCoordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = (point1.latitude * Math.PI) / 180;
    const lat2 = (point2.latitude * Math.PI) / 180;
    const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  /**
   * Get employees currently in a geofence
   */
  async getEmployeesInGeofence(geofenceId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('employee_locations')
      .select('employee_id, latitude, longitude')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    const geofence = await this.getById(geofenceId);
    if (!geofence) return [];

    // Get latest location for each employee
    const latestLocations = new Map<string, GeofenceCoordinates>();
    data?.forEach((loc) => {
      if (!latestLocations.has(loc.employee_id)) {
        latestLocations.set(loc.employee_id, {
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    });

    // Check which employees are inside
    const insideEmployees: string[] = [];
    latestLocations.forEach((coords, employeeId) => {
      if (this.isPointInGeofence(coords, geofence)) {
        insideEmployees.push(employeeId);
      }
    });

    return insideEmployees;
  },

  /**
   * Get geofence statistics
   */
  async getStatistics(
    geofenceId: string,
    dateRange?: { from: string; to: string }
  ): Promise<{
    totalEvents: number;
    enterEvents: number;
    exitEvents: number;
    dwellEvents: number;
    avgDwellTime: number;
    uniqueEmployees: number;
  }> {
    let query = supabase
      .from('geofence_events')
      .select('*')
      .eq('geofence_id', geofenceId);

    if (dateRange) {
      query = query.gte('timestamp', dateRange.from).lte('timestamp', dateRange.to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const events = data || [];
    const uniqueEmployees = new Set(events.map((e) => e.employee_id)).size;

    return {
      totalEvents: events.length,
      enterEvents: events.filter((e) => e.action === 'enter').length,
      exitEvents: events.filter((e) => e.action === 'exit').length,
      dwellEvents: events.filter((e) => e.action === 'dwell').length,
      avgDwellTime: 0, // Would need additional calculation
      uniqueEmployees,
    };
  },
};

export default geofenceService;
