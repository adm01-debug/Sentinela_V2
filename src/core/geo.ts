/**
 * @fileoverview Geo utilities
 * @module @sentinela/core/geo
 */
export interface Point { lat: number; lon: number; }
export function distance(a: Point, b: Point): number {
  const R = 6371; const dLat = (b.lat - a.lat) * Math.PI / 180; const dLon = (b.lon - a.lon) * Math.PI / 180;
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
export function isWithinRadius(point: Point, center: Point, radius: number): boolean { return distance(point, center) <= radius; }
export function boundingBox(center: Point, radius: number): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radius / 111; const lonDelta = radius / (111 * Math.cos(center.lat * Math.PI / 180));
  return { minLat: center.lat - latDelta, maxLat: center.lat + latDelta, minLon: center.lon - lonDelta, maxLon: center.lon + lonDelta };
}
