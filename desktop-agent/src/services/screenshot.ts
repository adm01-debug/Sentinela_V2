import log from "electron-log";
import screenshot from "screenshot-desktop";
import { CONFIG } from "../config";
import { DataSender } from "./dataSender";

export class ScreenshotService {
  private dataSender: DataSender;
  private timer: NodeJS.Timeout | null = null;

  constructor(dataSender: DataSender) {
    this.dataSender = dataSender;
  }

  start(): void {
    log.info("Screenshot service started");
    this.capture(); // Initial capture
    this.timer = setInterval(() => this.capture(), CONFIG.SCREENSHOT_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    log.info("Screenshot service stopped");
  }

  private async capture(): Promise<void> {
    try {
      const imgBuffer = (await screenshot({ format: "jpg" })) as Buffer;
      const base64 = imgBuffer.toString("base64");

      // Get active window info
      let windowTitle = "";
      let activeApp = "";
      try {
        const activeWin = await import("active-win");
        const win = await activeWin.default();
        if (win) {
          windowTitle = win.title || "";
          activeApp = win.owner?.name || "";
        }
      } catch {
        // active-win may fail on some systems
      }

      this.dataSender.send("screenshot", {
        image_base64: base64,
        window_title: windowTitle,
        active_app: activeApp,
      });

      log.debug("Screenshot captured successfully");
    } catch (error) {
      log.error("Screenshot capture failed:", error);
    }
  }
}
