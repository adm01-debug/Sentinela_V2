import { BrowserWindow } from 'electron';

export function getActiveWindow() {
  const win = BrowserWindow.getFocusedWindow();
  return win ? { id: win.id, title: win.getTitle() } : null;
}

export function getAllWindows() {
  return BrowserWindow.getAllWindows().map(w => ({ id: w.id, title: w.getTitle() }));
}