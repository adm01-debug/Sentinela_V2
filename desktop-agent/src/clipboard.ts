import { clipboard } from 'electron';

class ClipboardMonitor {
  private history: string[] = [];
  private last = '';
  check() { const t = clipboard.readText(); if (t !== this.last) { this.last = t; this.history.push(t); } }
  getHistory() { return this.history; }
}

export const clipboardMonitor = new ClipboardMonitor();