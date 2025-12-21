import { powerMonitor } from 'electron';

class BatteryMonitor {
  private charging = false;
  init() {
    powerMonitor.on('on-ac', () => this.charging = true);
    powerMonitor.on('on-battery', () => this.charging = false);
  }
  isCharging() { return this.charging; }
}

export const battery = new BatteryMonitor();