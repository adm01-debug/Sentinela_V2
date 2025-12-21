import { EventEmitter } from 'events';

class ActivityTracker extends EventEmitter {
  private activities: any[] = [];
  start() { this.emit('start'); }
  stop() { this.emit('stop'); }
  getActivities() { return this.activities; }
}

export const activityTracker = new ActivityTracker();