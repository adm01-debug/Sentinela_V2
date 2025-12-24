export class CronScheduler {
  private schedules: Map<string, { cron: string; callback: () => void; lastRun?: Date }> = new Map();
  
  schedule(name: string, cron: string, callback: () => void): void {
    this.schedules.set(name, { cron, callback });
  }
  
  unschedule(name: string): void { this.schedules.delete(name); }
  
  shouldRun(cron: string, now: Date): boolean {
    const parts = cron.split(' ');
    if (parts.length !== 5) return false;
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (minute !== '*' && parseInt(minute) !== now.getMinutes()) return false;
    if (hour !== '*' && parseInt(hour) !== now.getHours()) return false;
    if (dayOfMonth !== '*' && parseInt(dayOfMonth) !== now.getDate()) return false;
    if (month !== '*' && parseInt(month) !== now.getMonth() + 1) return false;
    if (dayOfWeek !== '*' && parseInt(dayOfWeek) !== now.getDay()) return false;
    
    return true;
  }
  
  tick(): void {
    const now = new Date();
    this.schedules.forEach((schedule, name) => {
      if (this.shouldRun(schedule.cron, now)) {
        if (!schedule.lastRun || now.getTime() - schedule.lastRun.getTime() >= 60000) {
          schedule.callback();
          schedule.lastRun = now;
        }
      }
    });
  }
}