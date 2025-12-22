import { BrowserWindow } from 'electron';
export function createSettingsWindow() { return new BrowserWindow({ width: 600, height: 500 }); }