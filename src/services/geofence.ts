export class GeofenceService {
  private static instance: GeofenceService;
  
  static getInstance() {
    if (!this.instance) this.instance = new GeofenceService();
    return this.instance;
  }
  
  async init() { console.log('geofence service initialized'); }
}

export const geofenceService = GeofenceService.getInstance();