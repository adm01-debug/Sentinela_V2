import { DesiredState, ActualState } from './reconciler';
export interface Drift { resource: string; field: string; desired: any; actual: any; detectedAt: Date; }
export class DriftDetector {
  private drifts: Drift[] = [];
  detect(desired: DesiredState, actual: ActualState): Drift[] { const drifts: Drift[] = []; const compareObjects = (d: any, a: any, path: string) => { for (const key of Object.keys(d)) { const newPath = path ? path + '.' + key : key; if (typeof d[key] === 'object' && d[key] !== null) { compareObjects(d[key], a?.[key], newPath); } else if (d[key] !== a?.[key]) { drifts.push({ resource: desired.kind + '/' + desired.name, field: newPath, desired: d[key], actual: a?.[key], detectedAt: new Date() }); } } }; compareObjects(desired.spec, actual.spec, ''); this.drifts.push(...drifts); return drifts; }
  getDrifts(): Drift[] { return [...this.drifts]; }
  clear(): void { this.drifts = []; }
}
export const driftDetector = new DriftDetector();
