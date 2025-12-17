import { globalShortcut, clipboard } from 'electron';
import * as activeWin from 'active-win';
import * as screenshot from 'screenshot-desktop';
import { Config } from '../config';
import { ApiService } from './api';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class MonitoringService {
  private config: Config;
  private api: ApiService;
  private intervals: NodeJS.Timeout[] = [];
  private keystrokeCount = 0;
  private activeTime = 0;
  private idleTime = 0;
  private lastActivity = Date.now();
  private currentApp = '';
  private appTimes: Map<string, { productive: number; unproductive: number; neutral: number }> = new Map();

  // Apps categorized
  private productiveApps = ['code', 'visual studio', 'excel', 'word', 'powerpoint', 'outlook', 'teams', 'slack', 'notion', 'figma'];
  private unproductiveApps = ['youtube', 'netflix', 'spotify', 'instagram', 'facebook', 'twitter', 'tiktok', 'games'];

  constructor(config: Config, api: ApiService) {
    this.config = config;
    this.api = api;
  }

  async start() {
    console.log('MonitoringService starting...');

    // Heartbeat every minute
    this.intervals.push(setInterval(() => this.api.heartbeat(), 60000));

    // Keystroke monitoring
    if (this.config.keystrokeEnabled) {
      this.startKeystrokeMonitoring();
    }

    // Screenshot monitoring
    if (this.config.screenshotEnabled) {
      this.startScreenshotMonitoring();
    }

    // Productivity monitoring
    if (this.config.productivityEnabled) {
      this.startProductivityMonitoring();
    }

    // Block print screen
    if (this.config.printScreenBlockEnabled) {
      this.blockPrintScreen();
    }

    // USB monitoring (requires native module)
    if (this.config.usbBlockEnabled) {
      this.startUsbMonitoring();
    }

    console.log('MonitoringService started');
  }

  stop() {
    console.log('MonitoringService stopping...');
    this.intervals.forEach(interval => clearInterval(interval));
    globalShortcut.unregisterAll();
  }

  private startKeystrokeMonitoring() {
    // Track activity via active window changes
    let lastCheck = Date.now();
    
    const checkInterval = setInterval(async () => {
      const now = Date.now();
      const elapsed = (now - lastCheck) / 1000;
      lastCheck = now;

      try {
        const win = await activeWin.default();
        if (win) {
          this.currentApp = win.owner.name;
          this.activeTime += elapsed;
          this.lastActivity = now;
          
          // Simulate keystroke counting based on activity
          // In production, use iohook for real keystroke counting
          this.keystrokeCount += Math.floor(Math.random() * 10);
        } else {
          this.idleTime += elapsed;
        }
      } catch (e) {
        // Ignore errors
      }
    }, 1000);

    this.intervals.push(checkInterval);

    // Send keystroke data at configured interval
    const sendInterval = setInterval(async () => {
      if (this.keystrokeCount > 0 || this.activeTime > 0) {
        await this.api.send('keystroke', {
          app_name: this.currentApp,
          keystrokes_count: this.keystrokeCount,
          active_time_seconds: Math.round(this.activeTime),
          idle_time_seconds: Math.round(this.idleTime),
          recorded_at: new Date().toISOString(),
        });

        this.keystrokeCount = 0;
        this.activeTime = 0;
        this.idleTime = 0;
      }
    }, this.config.keystrokeInterval * 1000);

    this.intervals.push(sendInterval);
  }

  private startScreenshotMonitoring() {
    const captureInterval = setInterval(async () => {
      try {
        const img = await screenshot.default({ format: 'png' });
        const filename = `screenshot_${uuidv4()}.png`;
        const tempPath = path.join(os.tmpdir(), filename);
        
        fs.writeFileSync(tempPath, img);
        
        // Get active window info
        const win = await activeWin.default();
        
        // In production, upload to storage and get URL
        // For now, we'll use a placeholder
        const captureUrl = `file://${tempPath}`;
        
        await this.api.send('screenshot', {
          capture_url: captureUrl,
          app_name: win?.owner.name || 'Desktop',
          window_title: win?.title || '',
          captured_at: new Date().toISOString(),
        });

        console.log('Screenshot captured:', filename);
      } catch (error) {
        console.error('Screenshot error:', error);
      }
    }, this.config.screenshotInterval * 60 * 1000);

    this.intervals.push(captureInterval);
  }

  private startProductivityMonitoring() {
    // Track app usage
    const trackInterval = setInterval(async () => {
      try {
        const win = await activeWin.default();
        if (win) {
          const appName = win.owner.name.toLowerCase();
          const current = this.appTimes.get(appName) || { productive: 0, unproductive: 0, neutral: 0 };
          
          if (this.productiveApps.some(a => appName.includes(a))) {
            current.productive += 1;
          } else if (this.unproductiveApps.some(a => appName.includes(a))) {
            current.unproductive += 1;
          } else {
            current.neutral += 1;
          }
          
          this.appTimes.set(appName, current);
        }
      } catch (e) {
        // Ignore errors
      }
    }, 1000);

    this.intervals.push(trackInterval);

    // Send productivity data every 5 minutes
    const sendInterval = setInterval(async () => {
      let productiveTotal = 0;
      let unproductiveTotal = 0;
      let neutralTotal = 0;
      const appsUsed: string[] = [];

      this.appTimes.forEach((times, app) => {
        productiveTotal += times.productive;
        unproductiveTotal += times.unproductive;
        neutralTotal += times.neutral;
        appsUsed.push(app);
      });

      if (productiveTotal > 0 || unproductiveTotal > 0 || neutralTotal > 0) {
        await this.api.send('productivity', {
          productive_time_seconds: productiveTotal,
          unproductive_time_seconds: unproductiveTotal,
          neutral_time_seconds: neutralTotal,
          apps_used: appsUsed,
          recorded_date: new Date().toISOString().split('T')[0],
        });

        this.appTimes.clear();
      }
    }, 5 * 60 * 1000);

    this.intervals.push(sendInterval);
  }

  private blockPrintScreen() {
    // Register global shortcut to block print screen
    const shortcuts = ['PrintScreen', 'Alt+PrintScreen', 'Ctrl+PrintScreen'];
    
    shortcuts.forEach(shortcut => {
      try {
        globalShortcut.register(shortcut, () => {
          console.log('Print screen blocked!');
          clipboard.clear();
          
          this.api.send('violation', {
            policy_name: 'Bloqueio de Print Screen',
            violation_type: 'print_screen',
            severity: 'medium',
            description: 'Tentativa de captura de tela bloqueada',
          });
        });
      } catch (e) {
        console.error(`Failed to register ${shortcut}:`, e);
      }
    });
  }

  private startUsbMonitoring() {
    // USB monitoring requires native module (usb-detection)
    // This is a simplified version
    try {
      const usbDetect = require('usb-detection');
      
      usbDetect.startMonitoring();
      
      usbDetect.on('add', (device: any) => {
        console.log('USB device connected:', device);
        
        this.api.send('violation', {
          policy_name: 'Bloqueio de USB',
          violation_type: 'usb_connected',
          severity: 'high',
          description: `Dispositivo USB conectado: ${device.deviceName || 'Desconhecido'}`,
        });
      });
    } catch (e) {
      console.log('USB monitoring not available:', e);
    }
  }
}
