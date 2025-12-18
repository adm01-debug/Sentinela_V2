import { Config } from '../config';

interface GeofenceCheckResult {
  allowed: boolean;
  message: string;
  nearest_geofence?: string;
  distance_meters?: number;
  should_block?: boolean;
}

export class GeofencingService {
  private config: Config;
  private lastCheckTime: number = 0;
  private checkIntervalMs: number = 60000; // Check every 60 seconds
  private currentPosition: { latitude: number; longitude: number } | null = null;

  constructor(config: Config) {
    this.config = config;
  }

  async getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
    // In Electron, we need to use a different approach for geolocation
    // We can use the system's IP-based geolocation or request from the renderer process
    
    // For now, we'll use a placeholder that should be replaced with actual implementation
    // Options:
    // 1. Use ip-api.com or similar service for IP-based geolocation
    // 2. Use navigator.geolocation from renderer process via IPC
    // 3. Use native modules like 'node-geolocation'
    
    try {
      // Using IP-based geolocation as fallback
      const response = await fetch('http://ip-api.com/json/?fields=lat,lon');
      const data = await response.json();
      
      if (data.lat && data.lon) {
        this.currentPosition = {
          latitude: data.lat,
          longitude: data.lon
        };
        return this.currentPosition;
      }
      
      return null;
    } catch (error) {
      console.error('[Geofencing] Error getting position:', error);
      return null;
    }
  }

  async checkGeofence(): Promise<GeofenceCheckResult | null> {
    if (!this.config.geofencingEnabled) {
      return null;
    }

    const now = Date.now();
    if (now - this.lastCheckTime < this.checkIntervalMs) {
      return null; // Skip if checked recently
    }

    this.lastCheckTime = now;

    const position = await this.getCurrentPosition();
    if (!position) {
      console.log('[Geofencing] Could not get current position');
      return null;
    }

    try {
      const response = await fetch(`${this.config.supabaseUrl}/functions/v1/check-geofence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          employee_name: this.config.employeeName,
          device: this.config.deviceName,
          latitude: position.latitude,
          longitude: position.longitude,
        }),
      });

      const result: GeofenceCheckResult = await response.json();
      
      if (!result.allowed) {
        console.log(`[Geofencing] Violation detected: ${result.message}`);
        
        // Notify user about geofence violation
        if (this.config.geofencingNotifyUser) {
          const { Notification } = await import('electron');
          new Notification({
            title: 'Alerta de Localização',
            body: `Você está fora da área permitida. ${result.message}`,
            icon: undefined,
          }).show();
        }
      }

      return result;
    } catch (error) {
      console.error('[Geofencing] Error checking geofence:', error);
      return null;
    }
  }

  setCheckInterval(intervalMs: number) {
    this.checkIntervalMs = intervalMs;
  }

  getLastPosition() {
    return this.currentPosition;
  }
}
