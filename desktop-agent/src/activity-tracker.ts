import { EventEmitter } from 'events';

interface Activity {
  timestamp: Date;
  type: 'mouse' | 'keyboard' | 'window' | 'idle';
  data: Record<string, unknown>;
}

interface ActivityTrackerConfig {
  idleThreshold: number;
  trackMouse: boolean;
  trackKeyboard: boolean;
  trackWindow: boolean;
}

class ActivityTracker extends EventEmitter {
  private activities: Activity[] = [];
  private config: ActivityTrackerConfig;
  private isTracking = false;

  constructor(config?: Partial<ActivityTrackerConfig>) {
    super();
    this.config = {
      idleThreshold: 300000, // 5 minutes
      trackMouse: true,
      trackKeyboard: true,
      trackWindow: true,
      ...config,
    };
  }

  start(): void {
    if (this.isTracking) return;
    this.isTracking = true;
    this.emit('tracking:started');
  }

  stop(): void {
    if (!this.isTracking) return;
    this.isTracking = false;
    this.emit('tracking:stopped');
  }

  record(activity: Omit<Activity, 'timestamp'>): void {
    if (!this.isTracking) return;
    
    const entry: Activity = {
      ...activity,
      timestamp: new Date(),
    };
    
    this.activities.push(entry);
    this.emit('activity:recorded', entry);
  }

  getActivities(): readonly Activity[] {
    return Object.freeze([...this.activities]);
  }

  clearActivities(): void {
    this.activities = [];
    this.emit('activities:cleared');
  }

  getStats(): { total: number; byType: Record<Activity['type'], number> } {
    const byType = this.activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<Activity['type'], number>);

    return {
      total: this.activities.length,
      byType,
    };
  }
}

export const activityTracker = new ActivityTracker();
export type { Activity, ActivityTrackerConfig };
