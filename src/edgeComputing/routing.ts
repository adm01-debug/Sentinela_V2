import { EdgeLocation } from './types';

export class EdgeRouter {
  constructor(private locations: EdgeLocation[]) {}
  
  selectLocation(clientRegion?: string): EdgeLocation | undefined {
    const healthy = this.locations.filter(l => l.healthy);
    if (healthy.length === 0) return undefined;
    
    if (clientRegion) {
      const sameRegion = healthy.find(l => l.region === clientRegion);
      if (sameRegion) return sameRegion;
    }
    
    return healthy.reduce((min, l) => l.latency < min.latency ? l : min);
  }
  
  getLatencyMap(): Map<string, number> {
    return new Map(this.locations.map(l => [l.id, l.latency]));
  }
}

export class GeolocationRouter {
  private regionMapping: Map<string, string[]> = new Map();
  
  addMapping(region: string, locations: string[]): void { this.regionMapping.set(region, locations); }
  
  route(clientCountry: string): string[] { return this.regionMapping.get(clientCountry) ?? this.regionMapping.get('default') ?? []; }
}