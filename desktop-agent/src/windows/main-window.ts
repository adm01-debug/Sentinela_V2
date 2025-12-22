import { BrowserWindow } from 'electron';
export function createMainWindow() { return new BrowserWindow({ width: 1200, height: 800 }); }