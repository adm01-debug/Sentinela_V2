interface TimeEntry { start: number; end?: number; app: string; }

class TimeTracker {
  private entries: TimeEntry[] = [];
  private current?: TimeEntry;
  start(app: string) { this.current = { start: Date.now(), app }; }
  stop() { if (this.current) { this.current.end = Date.now(); this.entries.push(this.current); this.current = undefined; } }
  getEntries() { return this.entries; }
}

export const timeTracker = new TimeTracker();