// ============================================================
// SENTINELA DESKTOP AGENT - MAIN ENTRY POINT
// Electron-based monitoring agent with encryption support
// ============================================================

import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } from 'electron';
import * as path from 'path';
import { MonitoringService } from './services/monitoring';
import { ApiService } from './services/api';
import { GeofencingService } from './services/geofencing';
import { CryptoService } from './services/crypto';
import { SecureStorageService } from './services/secureStorage';
import { config } from './config';

// ============================================================
// GLOBAL STATE
// ============================================================

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let monitoringService: MonitoringService | null = null;
let apiService: ApiService | null = null;
let geofencingService: GeofencingService | null = null;
let cryptoService: CryptoService | null = null;
let secureStorage: SecureStorageService | null = null;
let isMonitoring = false;
let offlineQueue: EncryptedData[] = [];

// ============================================================
// TYPES
// ============================================================

interface EncryptedData {
  type: 'screenshot' | 'activity' | 'keystroke' | 'geofence';
  encryptedPayload: string;
  iv: string;
  timestamp: string;
  retryCount: number;
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initializeServices() {
  try {
    console.log('[Agent] Initializing services...');

    // Initialize crypto service first
    cryptoService = new CryptoService();
    console.log('[Agent] Crypto service initialized');

    // Initialize secure storage
    secureStorage = new SecureStorageService(cryptoService);
    console.log('[Agent] Secure storage initialized');

    // Load stored credentials
    const storedApiKey = await secureStorage.get('api_key');
    const storedDeviceId = await secureStorage.get('device_id');

    // Initialize API service with stored credentials
    apiService = new ApiService({
      baseUrl: config.apiUrl,
      apiKey: storedApiKey || config.apiKey,
      deviceId: storedDeviceId || config.deviceId,
      cryptoService,
    });
    console.log('[Agent] API service initialized');

    // Initialize monitoring service
    monitoringService = new MonitoringService({
      screenshotInterval: config.screenshotInterval,
      trackKeystrokes: config.trackKeystrokes,
      trackApplications: config.trackApplications,
      onData: handleMonitoringData,
    });
    console.log('[Agent] Monitoring service initialized');

    // Initialize geofencing if enabled
    if (config.geofencingEnabled) {
      geofencingService = new GeofencingService({
        geofences: await loadGeofences(),
        onEnter: handleGeofenceEnter,
        onExit: handleGeofenceExit,
      });
      console.log('[Agent] Geofencing service initialized');
    }

    // Load offline queue
    const storedQueue = await secureStorage.get('offline_queue');
    if (storedQueue) {
      offlineQueue = JSON.parse(storedQueue);
      console.log(`[Agent] Loaded ${offlineQueue.length} items from offline queue`);
    }

    // Process offline queue
    await processOfflineQueue();

    console.log('[Agent] All services initialized successfully');
    return true;
  } catch (error) {
    console.error('[Agent] Failed to initialize services:', error);
    return false;
  }
}

// ============================================================
// MONITORING DATA HANDLING
// ============================================================

async function handleMonitoringData(data: {
  type: 'screenshot' | 'activity' | 'keystroke';
  payload: any;
}) {
  if (!cryptoService || !apiService) {
    console.error('[Agent] Services not initialized');
    return;
  }

  try {
    // Encrypt sensitive data before sending/storing
    const encryptedPayload = cryptoService.encrypt(JSON.stringify(data.payload));
    
    const encryptedData: EncryptedData = {
      type: data.type,
      encryptedPayload: encryptedPayload.encrypted,
      iv: encryptedPayload.iv,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    // Try to send to API
    const sent = await sendEncryptedData(encryptedData);

    if (!sent) {
      // Queue for later if offline
      offlineQueue.push(encryptedData);
      await saveOfflineQueue();
      console.log(`[Agent] Data queued offline. Queue size: ${offlineQueue.length}`);
    }
  } catch (error) {
    console.error('[Agent] Error handling monitoring data:', error);
  }
}

async function sendEncryptedData(data: EncryptedData): Promise<boolean> {
  if (!apiService) return false;

  try {
    await apiService.sendEncryptedData({
      type: data.type,
      payload: data.encryptedPayload,
      iv: data.iv,
      timestamp: data.timestamp,
    });
    return true;
  } catch (error) {
    console.error('[Agent] Failed to send data:', error);
    return false;
  }
}

// ============================================================
// OFFLINE QUEUE MANAGEMENT
// ============================================================

async function processOfflineQueue() {
  if (offlineQueue.length === 0) return;

  console.log(`[Agent] Processing offline queue: ${offlineQueue.length} items`);

  const processedItems: EncryptedData[] = [];

  for (const item of offlineQueue) {
    if (item.retryCount >= 5) {
      console.log('[Agent] Dropping item after 5 retries');
      processedItems.push(item);
      continue;
    }

    const sent = await sendEncryptedData(item);

    if (sent) {
      processedItems.push(item);
    } else {
      item.retryCount++;
    }

    // Small delay between items
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Remove processed items from queue
  offlineQueue = offlineQueue.filter(item => !processedItems.includes(item));
  await saveOfflineQueue();

  console.log(`[Agent] Queue processed. Remaining: ${offlineQueue.length}`);
}

async function saveOfflineQueue() {
  if (!secureStorage) return;
  await secureStorage.set('offline_queue', JSON.stringify(offlineQueue));
}

// ============================================================
// GEOFENCING
// ============================================================

async function loadGeofences() {
  if (!apiService) return [];
  
  try {
    return await apiService.getGeofences();
  } catch (error) {
    console.error('[Agent] Failed to load geofences:', error);
    return [];
  }
}

function handleGeofenceEnter(geofence: { id: string; name: string }) {
  console.log(`[Agent] Entered geofence: ${geofence.name}`);
  apiService?.sendGeofenceEvent({
    geofenceId: geofence.id,
    eventType: 'enter',
    timestamp: new Date().toISOString(),
  });
}

function handleGeofenceExit(geofence: { id: string; name: string }) {
  console.log(`[Agent] Exited geofence: ${geofence.name}`);
  apiService?.sendGeofenceEvent({
    geofenceId: geofence.id,
    eventType: 'exit',
    timestamp: new Date().toISOString(),
  });
}

// ============================================================
// WINDOW MANAGEMENT
// ============================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    show: false,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../views/index.html'));

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
}

// ============================================================
// TRAY MANAGEMENT
// ============================================================

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon);
  tray.setToolTip('Sentinela Agent');

  updateTrayMenu();

  tray.on('click', () => {
    mainWindow?.show();
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Sentinela Agent',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isMonitoring ? '⏹️ Pausar Monitoramento' : '▶️ Iniciar Monitoramento',
      click: () => toggleMonitoring(),
    },
    {
      label: `📊 Fila Offline: ${offlineQueue.length}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '⚙️ Configurações',
      click: () => mainWindow?.show(),
    },
    {
      label: '🔄 Sincronizar Agora',
      click: () => processOfflineQueue(),
    },
    { type: 'separator' },
    {
      label: '❌ Sair',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray?.setContextMenu(contextMenu);
}

// ============================================================
// MONITORING CONTROL
// ============================================================

async function toggleMonitoring() {
  if (isMonitoring) {
    await stopMonitoring();
  } else {
    await startMonitoring();
  }
}

async function startMonitoring() {
  if (!monitoringService) {
    console.error('[Agent] Monitoring service not initialized');
    return;
  }

  console.log('[Agent] Starting monitoring...');
  await monitoringService.start();
  geofencingService?.start();
  isMonitoring = true;
  updateTrayMenu();
  console.log('[Agent] Monitoring started');
}

async function stopMonitoring() {
  if (!monitoringService) return;

  console.log('[Agent] Stopping monitoring...');
  await monitoringService.stop();
  geofencingService?.stop();
  isMonitoring = false;
  updateTrayMenu();
  console.log('[Agent] Monitoring stopped');
}

// ============================================================
// IPC HANDLERS
// ============================================================

function setupIpcHandlers() {
  ipcMain.handle('get-status', () => ({
    isMonitoring,
    queueSize: offlineQueue.length,
    deviceId: config.deviceId,
  }));

  ipcMain.handle('toggle-monitoring', async () => {
    await toggleMonitoring();
    return isMonitoring;
  });

  ipcMain.handle('sync-now', async () => {
    await processOfflineQueue();
    return offlineQueue.length;
  });

  ipcMain.handle('save-credentials', async (_, { apiKey, deviceId }) => {
    if (!secureStorage) return false;
    
    await secureStorage.set('api_key', apiKey);
    await secureStorage.set('device_id', deviceId);
    
    // Reinitialize API service with new credentials
    if (apiService && cryptoService) {
      apiService = new ApiService({
        baseUrl: config.apiUrl,
        apiKey,
        deviceId,
        cryptoService,
      });
    }
    
    return true;
  });

  ipcMain.handle('clear-data', async () => {
    if (!secureStorage) return false;
    
    await secureStorage.clear();
    offlineQueue = [];
    
    return true;
  });
}

// ============================================================
// HEARTBEAT
// ============================================================

function startHeartbeat() {
  setInterval(async () => {
    if (!apiService || !isMonitoring) return;

    try {
      await apiService.sendHeartbeat({
        timestamp: new Date().toISOString(),
        status: 'online',
        queueSize: offlineQueue.length,
      });
    } catch (error) {
      console.error('[Agent] Heartbeat failed:', error);
    }
  }, config.heartbeatInterval);
}

// ============================================================
// APP LIFECYCLE
// ============================================================

app.whenReady().then(async () => {
  console.log('[Agent] Application starting...');

  // Initialize services
  const initialized = await initializeServices();

  if (!initialized) {
    console.error('[Agent] Failed to initialize. Exiting...');
    app.quit();
    return;
  }

  // Create window and tray
  createWindow();
  createTray();

  // Setup IPC handlers
  setupIpcHandlers();

  // Start heartbeat
  startHeartbeat();

  // Auto-start monitoring if configured
  if (config.autoStart) {
    await startMonitoring();
  }

  // Process offline queue periodically
  setInterval(() => {
    processOfflineQueue();
  }, config.offlineQueueInterval);

  console.log('[Agent] Application ready');
});

app.on('window-all-closed', () => {
  // Don't quit on window close - run in tray
});

app.on('before-quit', async () => {
  console.log('[Agent] Application quitting...');
  await stopMonitoring();
  await saveOfflineQueue();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
    }
  });
}
