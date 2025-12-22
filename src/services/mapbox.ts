export class MapboxService {
  private static instance: MapboxService;
  
  static getInstance() {
    if (!this.instance) this.instance = new MapboxService();
    return this.instance;
  }
  
  async init() { console.log('mapbox service initialized'); }
}

export const mapboxService = MapboxService.getInstance();