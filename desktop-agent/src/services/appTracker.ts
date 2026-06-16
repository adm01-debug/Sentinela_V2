import log from "electron-log";
import { CONFIG } from "../config";
import { DataSender } from "./dataSender";

interface AppSession {
  app_name: string;
  window_title: string;
  start_time: string;
  duration_seconds: number;
}

export class AppTrackerService {
  private dataSender: DataSender;
  private pollTimer: NodeJS.Timeout | null = null;
  private currentApp: AppSession | null = null;

  constructor(dataSender: DataSender) {
    this.dataSender = dataSender;
  }

  start(): void {
    log.info("App tracker service started");
    this.pollTimer = setInterval(() => this.poll(), CONFIG.APP_TRACKING_INTERVAL_MS);
  }

  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.finishCurrentSession();
    log.info("App tracker service stopped");
  }

  private async poll(): Promise<void> {
    try {
      const activeWin = await import("active-win");
      const win = await activeWin.default();

      if (!win) return;

      const appName = win.owner?.name || "Unknown";
      const windowTitle = win.title || "";

      if (this.currentApp && this.currentApp.app_name !== appName) {
        this.finishCurrentSession();
      }

      if (!this.currentApp || this.currentApp.app_name !== appName) {
        this.currentApp = {
          app_name: appName,
          window_title: windowTitle,
          start_time: new Date().toISOString(),
          duration_seconds: 0,
        };
      } else {
        this.currentApp.duration_seconds += CONFIG.APP_TRACKING_INTERVAL_MS / 1000;
        this.currentApp.window_title = windowTitle;
      }

      // Report every 5 minutes of continuous use
      if (this.currentApp.duration_seconds >= 300) {
        this.finishCurrentSession();
      }
    } catch (error) {
      log.error("App tracking poll failed:", error);
    }
  }

  private finishCurrentSession(): void {
    if (!this.currentApp || this.currentApp.duration_seconds < 5) return;

    this.dataSender.send("application", {
      app_name: this.currentApp.app_name,
      window_title: this.currentApp.window_title,
      start_time: this.currentApp.start_time,
      end_time: new Date().toISOString(),
      duration_seconds: Math.round(this.currentApp.duration_seconds),
    });

    this.currentApp = null;
  }
}
