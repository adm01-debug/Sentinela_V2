import { powerMonitor } from 'electron';

export function getIdleTime(): number {
  return powerMonitor.getSystemIdleTime();
}

export function isUserActive(): boolean {
  return getIdleTime() < 60;
}
