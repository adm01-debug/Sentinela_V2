import { globalShortcut } from 'electron';

const handlers: Map<string, () => void> = new Map();

export function registerHotkey(key: string, handler: () => void) {
  globalShortcut.register(key, handler);
  handlers.set(key, handler);
}

export function unregisterAll() { globalShortcut.unregisterAll(); }