import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import * as path from 'path';
import { CONFIG } from '../config';

// ============================================================
// Violation Notifier — LGPD real-time awareness overlay
// Polls backend for pending violations and opens a top-most
// overlay window; user must acknowledge to close.
// ============================================================

interface PendingViolation {
  id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  policy_name: string;
  description: string | null;
  created_at: string;
  employee_notified_at: string | null;
}

const POLL_INTERVAL_MS = 20 * 1000;
const OVERLAY_TIMEOUT_MS = 5 * 60 * 1000;

export class ViolationNotifier {
  private agentKey: string;
  private deviceName: string;
  private timer: NodeJS.Timeout | null = null;
  private activeWindows = new Map<string, BrowserWindow>();
  private ipcRegistered = false;

  constructor(agentKey: string, deviceName: string) {
    this.agentKey = agentKey;
    this.deviceName = deviceName;
  }

  start(): void {
    log.info('Violation notifier started');
    this.registerIpc();
    this.tick().catch((e) => log.debug('notifier initial tick error', e));
    this.timer = setInterval(() => {
      this.tick().catch((e) => log.debug('notifier tick error', e));
    }, POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    for (const win of this.activeWindows.values()) {
      try { win.close(); } catch { /* ignore */ }
    }
    this.activeWindows.clear();
  }

  private registerIpc(): void {
    if (this.ipcRegistered) return;
    this.ipcRegistered = true;

    ipcMain.handle('violation:acknowledge', async (_e, payload: { id: string; reason?: string }) => {
      const ok = await this.sendAck(payload.id, 'acknowledged', payload.reason);
      const win = this.activeWindows.get(payload.id);
      if (win) {
        this.activeWindows.delete(payload.id);
        try { win.close(); } catch { /* ignore */ }
      }
      return { success: ok };
    });
  }

  private async tick(): Promise<void> {
    const res = await fetch(`${CONFIG.API_URL}/pending-employee-violations`, {
      method: 'GET',
      headers: { 'x-agent-key': this.agentKey },
    });
    if (!res.ok) return;
    const data = (await res.json()) as { violations?: PendingViolation[] };
    const list = data.violations ?? [];
    for (const v of list) {
      if (!this.activeWindows.has(v.id)) {
        this.openOverlay(v);
      }
    }
  }

  private async sendAck(
    violationId: string,
    action: 'notified' | 'acknowledged',
    reason?: string,
  ): Promise<boolean> {
    try {
      const res = await fetch(`${CONFIG.API_URL}/acknowledge-violation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-key': this.agentKey,
        },
        body: JSON.stringify({
          violation_id: violationId,
          action,
          reason,
          device: this.deviceName,
        }),
      });
      return res.ok;
    } catch (e) {
      log.warn('sendAck failed', e);
      return false;
    }
  }

  private openOverlay(v: PendingViolation): void {
    const win = new BrowserWindow({
      width: 520,
      height: 560,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      frame: false,
      skipTaskbar: false,
      title: 'Sentinela — Aviso de Conformidade',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, '../preload.js'),
      },
    });

    win.setAlwaysOnTop(true, 'screen-saver');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    const overlayPath = path.join(__dirname, '../../renderer/violation-overlay.html');
    const q = new URLSearchParams({
      id: v.id,
      type: v.violation_type,
      severity: v.severity,
      policy: v.policy_name,
      description: v.description ?? '',
      createdAt: v.created_at,
    }).toString();
    win.loadFile(overlayPath, { search: q });

    win.on('close', (e) => {
      // Prevent closing without acknowledgment (unless timeout removes it)
      if (this.activeWindows.has(v.id)) {
        e.preventDefault();
        win.focus();
      }
    });

    this.activeWindows.set(v.id, win);

    // Mark notified
    void this.sendAck(v.id, 'notified');

    // Timeout: auto-close but record reason
    setTimeout(() => {
      if (this.activeWindows.has(v.id)) {
        void this.sendAck(v.id, 'acknowledged', 'timeout_auto_dismiss');
        this.activeWindows.delete(v.id);
        try { win.close(); } catch { /* ignore */ }
      }
    }, OVERLAY_TIMEOUT_MS);
  }
}
