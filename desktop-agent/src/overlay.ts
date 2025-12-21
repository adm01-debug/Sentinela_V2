import { BrowserWindow } from 'electron';

export function createOverlay(): BrowserWindow {
  const overlay = new BrowserWindow({
    width: 300, height: 100,
    transparent: true, frame: false,
    alwaysOnTop: true, skipTaskbar: true
  });
  return overlay;
}