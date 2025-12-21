interface TelemetryEvent { name: string; properties?: Record<string, unknown>; timestamp: number; }

class Telemetry {
  private events: TelemetryEvent[] = [];
  track(name: string, properties?: Record<string, unknown>) {
    this.events.push({ name, properties, timestamp: Date.now() });
  }
  flush() { const events = [...this.events]; this.events = []; return events; }
}

export const telemetry = new Telemetry();