import * as path from "path";
import { timingSafeEqual } from "crypto";
import { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } from "electron";
import log from "electron-log";
import Store from "electron-store";
import AutoLaunch from "auto-launch";
import { CONFIG } from "./config";
import { AuthService } from "./services/auth";
import { ScreenshotService } from "./services/screenshot";
import { KeystrokeService } from "./services/keystroke";
import { AppTrackerService } from "./services/appTracker";
import { UsbBlockerService } from "./services/usbBlocker";
import { PrintScreenBlocker } from "./services/printScreenBlocker";
import { DataSender } from "./services/dataSender";
import { AutoUpdaterService } from "./services/autoUpdater";
import { IdleDetector } from "./services/idleDetector";
import { ClipboardDLP } from "./services/dlp/clipboardDLP";
import { PolicySync } from "./services/dlp/policySync";

// ============================================================
// GLOBALS
// ============================================================
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAuthenticated = false;
let stealthMode = false;

const store = new Store({
  encryptionKey: "sentinela-secure-storage-key",
  schema: {
    agentKey: { type: "string", default: "" },
    deviceName: { type: "string", default: "" },
    stealthMode: { type: "boolean", default: false },
    stealthPassword: { type: "string", default: "" },
  },
});

// Services
let authService: AuthService;
let screenshotService: ScreenshotService;
let keystrokeService: KeystrokeService;
let appTrackerService: AppTrackerService;
let usbBlockerService: UsbBlockerService;
let printScreenBlocker: PrintScreenBlocker;
let dataSender: DataSender;
let autoUpdaterService: AutoUpdaterService;
let idleDetector: IdleDetector;
let clipboardDLP: ClipboardDLP;
let policySync: PolicySync;

// Auto-launch
const autoLauncher = new AutoLaunch({
  name: "Sentinela Agent",
  isHidden: true,
});

// ============================================================
// WINDOW CREATION
// ============================================================
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 600,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    show: false,
    skipTaskbar: stealthMode,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.on("close", (event) => {
    if (stealthMode && store.get("stealthMode")) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("ready-to-show", () => {
    if (!stealthMode) {
      mainWindow?.show();
    }
  });
}

// ============================================================
// TRAY
// ============================================================
function createTray(): void {
  const iconPath = path.join(__dirname, "../resources/tray-icon.png");
  tray = new Tray(iconPath);

  updateTrayMenu();

  tray.on("double-click", () => {
    if (!stealthMode) {
      mainWindow?.show();
    }
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const contextMenu = stealthMode
    ? Menu.buildFromTemplate([]) // Empty menu in stealth
    : Menu.buildFromTemplate([
        {
          label: `Sentinela Agent v${app.getVersion()}`,
          enabled: false,
        },
        { type: "separator" },
        {
          label: isAuthenticated ? "🟢 Conectado" : "🔴 Desconectado",
          enabled: false,
        },
        { type: "separator" },
        {
          label: "Abrir Painel",
          click: () => mainWindow?.show(),
        },
        {
          label: "Verificar Atualizações",
          click: () => autoUpdaterService?.checkForUpdates(),
        },
        { type: "separator" },
        {
          label: "Sair",
          click: () => {
            app.quit();
          },
        },
      ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(isAuthenticated ? "Sentinela - Conectado" : "Sentinela - Desconectado");
}

// ============================================================
// STEALTH MODE
// ============================================================
function toggleStealthMode(): void {
  const password = store.get("stealthPassword") as string;

  if (stealthMode) {
    // Exiting stealth - require password
    if (password) {
      mainWindow?.webContents.send("request-stealth-password");
    } else {
      disableStealth();
    }
  } else {
    enableStealth();
  }
}

function enableStealth(): void {
  stealthMode = true;
  store.set("stealthMode", true);
  mainWindow?.hide();
  mainWindow?.setSkipTaskbar(true);

  if (tray) {
    tray.destroy();
    tray = null;
  }

  log.info("Stealth mode enabled");
}

function disableStealth(): void {
  stealthMode = false;
  store.set("stealthMode", false);
  mainWindow?.setSkipTaskbar(false);
  mainWindow?.show();
  createTray();

  log.info("Stealth mode disabled");
}

// ============================================================
// SERVICES INITIALIZATION
// ============================================================
async function initializeServices(): Promise<void> {
  const agentKey = store.get("agentKey") as string;

  if (!agentKey) {
    log.info("No agent key configured, showing setup window");
    mainWindow?.show();
    return;
  }

  // Auth
  authService = new AuthService(agentKey);
  const authResult = await authService.validate();

  if (!authResult.valid) {
    log.error("Agent key validation failed:", authResult.error);
    mainWindow?.webContents.send("auth-error", authResult.error);
    mainWindow?.show();
    return;
  }

  isAuthenticated = true;
  updateTrayMenu();
  mainWindow?.webContents.send("auth-success", authResult);
  log.info("Agent authenticated successfully");

  // Data sender (must be first - other services depend on it)
  dataSender = new DataSender(agentKey);

  // Screenshot service
  screenshotService = new ScreenshotService(dataSender);
  screenshotService.start();

  // Keystroke service
  keystrokeService = new KeystrokeService(dataSender);
  keystrokeService.start();

  // App tracker
  appTrackerService = new AppTrackerService(dataSender);
  appTrackerService.start();

  // USB blocker
  usbBlockerService = new UsbBlockerService(dataSender);
  usbBlockerService.start();

  // Print screen blocker
  printScreenBlocker = new PrintScreenBlocker(dataSender);
  printScreenBlocker.start();

  // Idle detector
  idleDetector = new IdleDetector(dataSender);
  idleDetector.start();

  // DLP — policy sync + clipboard interceptor
  policySync = new PolicySync(agentKey);
  await policySync.start();
  clipboardDLP = new ClipboardDLP(agentKey);
  clipboardDLP.start();

  // Auto-updater
  autoUpdaterService = new AutoUpdaterService();
  autoUpdaterService.start();

  // Send login event
  dataSender.send("login", { timestamp: new Date().toISOString() });

  log.info("All monitoring services started");
}

function stopServices(): void {
  screenshotService?.stop();
  keystrokeService?.stop();
  appTrackerService?.stop();
  usbBlockerService?.stop();
  printScreenBlocker?.stop();
  idleDetector?.stop();
  clipboardDLP?.stop();
  policySync?.stop();

  if (dataSender) {
    if (isAuthenticated) {
      dataSender.send("logout", { timestamp: new Date().toISOString() });
    }
    dataSender.flush();
  }
}

// ============================================================
// IPC HANDLERS
// ============================================================
function setupIPC(): void {
  ipcMain.handle("get-status", () => ({
    authenticated: isAuthenticated,
    stealthMode,
    version: app.getVersion(),
    agentKey: store.get("agentKey") ? "****" + (store.get("agentKey") as string).slice(-4) : "",
  }));

  ipcMain.handle("set-agent-key", async (_event, key: string) => {
    store.set("agentKey", key);
    await initializeServices();
    return { success: isAuthenticated };
  });

  ipcMain.handle("toggle-stealth", () => {
    toggleStealthMode();
    return { stealthMode };
  });

  ipcMain.handle("verify-stealth-password", (_event, password: string) => {
    const stored = store.get("stealthPassword") as string;
    const storedBuffer = Buffer.from(stored || "");
    const inputBuffer = Buffer.from(password || "");
    if (storedBuffer.length === inputBuffer.length && timingSafeEqual(storedBuffer, inputBuffer)) {
      disableStealth();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle("set-stealth-password", (_event, password: string) => {
    store.set("stealthPassword", password);
    return { success: true };
  });
}

// ============================================================
// APP LIFECYCLE
// ============================================================
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    log.info(`Sentinela Agent v${app.getVersion()} starting...`);

    // Setup auto-launch
    try {
      const isEnabled = await autoLauncher.isEnabled();
      if (!isEnabled) {
        await autoLauncher.enable();
      }
    } catch (err) {
      log.error("Auto-launch setup failed:", err);
    }

    // Stealth mode from store
    stealthMode = store.get("stealthMode") as boolean;

    createWindow();

    if (!stealthMode) {
      createTray();
    }

    setupIPC();

    // Register stealth shortcut
    globalShortcut.register(CONFIG.STEALTH_SHORTCUT, toggleStealthMode);

    // Initialize monitoring
    await initializeServices();
  });

  app.on("will-quit", () => {
    stopServices();
    globalShortcut.unregisterAll();
  });

  app.on("window-all-closed", (e: Event) => {
    e.preventDefault(); // Keep running in tray
  });
}
