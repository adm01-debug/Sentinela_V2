import { BrowserWindow } from 'electron';
export function createNoticeWindow() { return new BrowserWindow({ width: 400, height: 200 }); }