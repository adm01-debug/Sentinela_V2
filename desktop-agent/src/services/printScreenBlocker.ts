import log from "electron-log";
import { globalShortcut, clipboard } from "electron";
import { DataSender } from "./dataSender";

export class PrintScreenBlocker {
  private dataSender: DataSender;
  private clipboardTimer: NodeJS.Timeout | null = null;
  private lastClipboardImage: string | null = null;

  constructor(dataSender: DataSender) {
    this.dataSender = dataSender;
  }

  start(): void {
    log.info("Print screen blocker started");

    // Block common screenshot shortcuts
    const shortcuts = [
      "PrintScreen",
      "Alt+PrintScreen",
      "CommandOrControl+PrintScreen",
      "Shift+CommandOrControl+S", // Windows Snipping Tool
      "Shift+CommandOrControl+3", // macOS
      "Shift+CommandOrControl+4", // macOS
    ];

    for (const shortcut of shortcuts) {
      try {
        globalShortcut.register(shortcut, () => {
          log.warn(`Screenshot attempt blocked: ${shortcut}`);

          // Clear clipboard to prevent paste
          clipboard.clear();

          this.dataSender.send("activity", {
            active_window: `PRINTSCREEN_BLOCKED: ${shortcut}`,
            keystrokes: 0,
            idle_time: 0,
          });
        });
      } catch {
        log.debug(`Could not register shortcut: ${shortcut}`);
      }
    }

    // Monitor clipboard for screenshot images
    this.clipboardTimer = setInterval(() => this.checkClipboard(), 1000);
  }

  stop(): void {
    if (this.clipboardTimer) {
      clearInterval(this.clipboardTimer);
      this.clipboardTimer = null;
    }
    log.info("Print screen blocker stopped");
  }

  private checkClipboard(): void {
    try {
      const image = clipboard.readImage();

      if (!image.isEmpty()) {
        const dataUrl = image.toDataURL();

        if (dataUrl !== this.lastClipboardImage) {
          // New image detected in clipboard - likely a screenshot
          this.lastClipboardImage = dataUrl;

          // Clear it
          clipboard.clear();

          log.warn("Screenshot detected in clipboard - cleared");

          this.dataSender.send("activity", {
            active_window: "CLIPBOARD_SCREENSHOT_CLEARED",
            keystrokes: 0,
            idle_time: 0,
          });
        }
      } else {
        this.lastClipboardImage = null;
      }
    } catch {
      // Clipboard access may fail occasionally
    }
  }
}
