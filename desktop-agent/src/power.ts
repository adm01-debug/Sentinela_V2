import { powerSaveBlocker } from 'electron';

let blockerId: number | null = null;

export function preventSleep() { if (!blockerId) blockerId = powerSaveBlocker.start('prevent-display-sleep'); }
export function allowSleep() { if (blockerId) { powerSaveBlocker.stop(blockerId); blockerId = null; } }