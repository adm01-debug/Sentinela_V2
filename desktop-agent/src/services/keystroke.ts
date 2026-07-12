import log from "electron-log";
import { CONFIG } from "../config";
import { DataSender } from "./dataSender";

export class KeystrokeService {
  private dataSender: DataSender;
  private keystrokeCount = 0;
  private reportTimer: NodeJS.Timeout | null = null;
  private currentApp = "";
  private currentWindow = "";

  constructor(dataSender: DataSender) {
    this.dataSender = dataSender;
  }

  start(): void {
    log.info("Keystroke service started");

    // Use a polling approach for keystroke counting
    // iohook provides low-level keyboard hooks on Windows
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- optional native module, may be absent at runtime
      const ioHook = require("iohook");

      ioHook.on("keydown", (_event: { keycode: number; rawcode: number }) => {
        this.keystrokeCount++;
        this.updateActiveWindow();
      });

      ioHook.start();
      log.info("iohook keyboard hook registered");
    } catch (error) {
      log.warn("iohook not available, keystroke counting disabled:", error);
    }

    // Report keystrokes periodically
    this.reportTimer = setInterval(() => this.report(), CONFIG.ACTIVITY_REPORT_INTERVAL_MS);
  }

  stop(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- optional native module, may be absent at runtime
      const ioHook = require("iohook");
      ioHook.stop();
    } catch {
      // ignore
    }

    this.report(); // Final report
    log.info("Keystroke service stopped");
  }

  private async updateActiveWindow(): Promise<void> {
    try {
      const activeWin = await import("active-win");
      const win = await activeWin.default();
      if (win) {
        this.currentApp = win.owner?.name || "";
        this.currentWindow = win.title || "";
      }
    } catch (error) {
      log.warn("Failed to get active window:", error);
    }
  }

  private report(): void {
    if (this.keystrokeCount === 0) return;

    this.dataSender.send("keystroke", {
      total_keystrokes: this.keystrokeCount,
      app_name: this.currentApp,
      window_title: this.currentWindow,
    });

    this.keystrokeCount = 0;
  }
}
