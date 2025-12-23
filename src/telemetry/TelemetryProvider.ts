type TelemetryEvent = { name: string; properties?: Record<string, any>; timestamp: Date };
class TelemetryProvider {
  private events: TelemetryEvent[] = [];
  private enabled = true;
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  track(name: string, properties?: Record<string, any>) { if (this.enabled) this.events.push({ name, properties, timestamp: new Date() }); }
  getEvents(): TelemetryEvent[] { return [...this.events]; }
  clear() { this.events = []; }
  flush(): TelemetryEvent[] { const events = this.events; this.events = []; return events; }
}
export const telemetryProvider = new TelemetryProvider();
