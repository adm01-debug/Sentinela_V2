import { VirtualService, HTTPRouteDestination } from './types';

export class TrafficManager {
  canaryRelease(vs: VirtualService, canaryWeight: number): VirtualService {
    const updated = { ...vs, http: vs.http.map(route => ({
      ...route,
      route: this.adjustWeights(route.route, canaryWeight)
    }))};
    return updated;
  }
  
  private adjustWeights(destinations: HTTPRouteDestination[], canaryWeight: number): HTTPRouteDestination[] {
    if (destinations.length < 2) return destinations;
    return destinations.map((d, i) => ({ ...d, weight: i === 0 ? 100 - canaryWeight : canaryWeight }));
  }
  
  mirrorTraffic(vs: VirtualService, mirrorHost: string, percentage: number): VirtualService {
    return { ...vs, http: vs.http.map(route => ({ ...route, mirror: { host: mirrorHost }, mirrorPercentage: { value: percentage } })) };
  }
  
  abTest(vs: VirtualService, headerName: string, headerValue: string, targetSubset: string): VirtualService {
    const abRoute = { match: [{ headers: { [headerName]: { exact: headerValue } } }], route: [{ destination: { host: vs.hosts[0], subset: targetSubset } }] };
    return { ...vs, http: [abRoute, ...vs.http] };
  }
}