export interface Segment { id: string; name: string; resources: string[]; allowedSegments: string[]; policies: string[]; }
export class MicroSegmentation {
  private segments = new Map<string, Segment>();
  createSegment(name: string, resources: string[]): Segment { const segment: Segment = { id: crypto.randomUUID(), name, resources, allowedSegments: [], policies: [] }; this.segments.set(segment.id, segment); return segment; }
  allowCommunication(fromId: string, toId: string): void { const from = this.segments.get(fromId); if (from && !from.allowedSegments.includes(toId)) from.allowedSegments.push(toId); }
  canCommunicate(fromId: string, toId: string): boolean { const from = this.segments.get(fromId); return from?.allowedSegments.includes(toId) || false; }
  getSegmentForResource(resourceId: string): Segment | undefined { return Array.from(this.segments.values()).find(s => s.resources.includes(resourceId)); }
}
export const microSegmentation = new MicroSegmentation();
