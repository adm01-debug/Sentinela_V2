import { powerMonitor } from 'electron';

export function getIdleTime(): number { return powerMonitor.getSystemIdleTime(); }

export function isIdle(threshold = 300): boolean { return getIdleTime() > threshold; }