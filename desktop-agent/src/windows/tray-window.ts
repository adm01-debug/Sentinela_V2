import { BrowserWindow } from 'electron';
export function createTrayWindow() { return new BrowserWindow({ width: 300, height: 400, show: false }); }