import { globalShortcut, clipboard, Notification } from 'electron';
import * as activeWin from 'active-win';
import * as screenshot from 'screenshot-desktop';
import { Config } from '../config';
import { ApiService, ViolationRule } from './api';
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
  private currentWindowTitle = '';
  private appTimes: Map<string, { productive: number; unproductive: number; neutral: number }> = new Map();
  private typedBuffer = ''; // Buffer for keyword detection
  private violationRules: ViolationRule[] = [];

  // Apps categorized
  private productiveApps = ['code', 'visual studio', 'excel', 'word', 'powerpoint', 'outlook', 'teams', 'slack', 'notion', 'figma'];
  private unproductiveApps = ['youtube', 'netflix', 'spotify', 'instagram', 'facebook', 'twitter', 'tiktok', 'games'];

  constructor(config: Config, api: ApiService) {
    this.config = config;
    this.api = api;
  }

  async start() {
    console.log('MonitoringService starting...');

    // Fetch violation rules on start
    await this.refreshRules();

    // Refresh rules every 5 minutes
    this.intervals.push(setInterval(() => this.refreshRules(), 5 * 60 * 1000));

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

    // Start violation rule checking
    this.startViolationChecking();

    console.log('MonitoringService started');
  }

  stop() {
    console.log('MonitoringService stopping...');
    this.intervals.forEach(interval => clearInterval(interval));
    globalShortcut.unregisterAll();
  }

  private async refreshRules() {
    this.violationRules = await this.api.fetchViolationRules();
    console.log(`Loaded ${this.violationRules.length} active violation rules`);
  }

  private startViolationChecking() {
    // Check active window against rules every 2 seconds
    const checkInterval = setInterval(async () => {
      try {
        const win = await activeWin.default();
        if (win) {
          this.currentApp = win.owner.name;
          this.currentWindowTitle = win.title || '';
          
          // Check blocked apps
          await this.checkBlockedApps(win.owner.name);
          
          // Check blocked sites (via window title/URL)
          await this.checkBlockedSites(win.title || '');
          
          // Check work hours
          await this.checkWorkHours();
        }
      } catch (e) {
        // Ignore errors
      }
    }, 2000);

    this.intervals.push(checkInterval);

    // Clear typed buffer periodically (keep last 60 seconds of typing)
    setInterval(() => {
      if (this.typedBuffer.length > 1000) {
        this.typedBuffer = this.typedBuffer.slice(-500);
      }
    }, 30000);
  }

  private async checkBlockedApps(appName: string) {
    const blockedAppRules = this.violationRules.filter(r => r.rule_type === 'blocked_app' && r.is_active);
    
    for (const rule of blockedAppRules) {
      if (appName.toLowerCase().includes(rule.rule_value.toLowerCase())) {
        await this.triggerViolation(rule, `Aplicativo bloqueado detectado: ${appName}`);
      }
    }
  }

  private async checkBlockedSites(windowTitle: string) {
    const blockedSiteRules = this.violationRules.filter(r => r.rule_type === 'blocked_site' && r.is_active);
    
    for (const rule of blockedSiteRules) {
      // Check if window title contains the blocked site
      if (windowTitle.toLowerCase().includes(rule.rule_value.toLowerCase())) {
        await this.triggerViolation(rule, `Site bloqueado detectado: ${rule.rule_value} em "${windowTitle}"`);
      }
    }
  }

  private async checkBlockedKeywords(text: string) {
    const blockedKeywordRules = this.violationRules.filter(r => r.rule_type === 'blocked_keyword' && r.is_active);
    
    for (const rule of blockedKeywordRules) {
      if (text.toLowerCase().includes(rule.rule_value.toLowerCase())) {
        await this.triggerViolation(rule, `Palavra-chave bloqueada detectada: "${rule.rule_value}"`);
      }
    }
  }

  private async checkWorkHours() {
    const workHoursRules = this.violationRules.filter(r => r.rule_type === 'work_hours' && r.is_active);
    
    for (const rule of workHoursRules) {
      try {
        // Expected format: "09:00-18:00" or "09:00-12:00,13:00-18:00"
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const periods = rule.rule_value.split(',');
        
        let withinWorkHours = false;
        for (const period of periods) {
          const [start, end] = period.split('-');
          const [startHour, startMin] = start.split(':').map(Number);
          const [endHour, endMin] = end.split(':').map(Number);
          
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;
          
          if (currentTime >= startTime && currentTime <= endTime) {
            withinWorkHours = true;
            break;
          }
        }
        
        if (!withinWorkHours) {
          await this.triggerViolation(rule, `Uso fora do horário de trabalho permitido (${rule.rule_value})`);
        }
      } catch (e) {
        console.error('Error checking work hours:', e);
      }
    }
  }

  private async checkBlockedFileExtensions(filename: string) {
    const blockedExtRules = this.violationRules.filter(r => r.rule_type === 'blocked_file_extension' && r.is_active);
    
    for (const rule of blockedExtRules) {
      const ext = rule.rule_value.startsWith('.') ? rule.rule_value : `.${rule.rule_value}`;
      if (filename.toLowerCase().endsWith(ext.toLowerCase())) {
        await this.triggerViolation(rule, `Arquivo com extensão bloqueada: ${filename}`);
      }
    }
  }

  private recentViolations: Map<string, number> = new Map();
  
  private async triggerViolation(rule: ViolationRule, description: string) {
    // Avoid duplicate violations within 5 minutes
    const violationKey = `${rule.id}-${rule.rule_value}`;
    const lastViolation = this.recentViolations.get(violationKey) || 0;
    const now = Date.now();
    
    if (now - lastViolation < 5 * 60 * 1000) {
      return; // Skip duplicate violation
    }
    
    this.recentViolations.set(violationKey, now);
    
    console.log(`VIOLATION DETECTED: ${description}`);

    // Capture screenshot as evidence
    let screenshotUrl = '';
    try {
      const img = await screenshot.default({ format: 'png' });
      const filename = `violation_${uuidv4()}.png`;
      const tempPath = path.join(os.tmpdir(), filename);
      fs.writeFileSync(tempPath, img);
      screenshotUrl = `file://${tempPath}`;
    } catch (e) {
      console.error('Failed to capture violation screenshot:', e);
    }

    // Send violation to server
    await this.api.send('violation', {
      policy_name: rule.description || `Regra: ${rule.rule_value}`,
      violation_type: rule.rule_type,
      severity: rule.severity,
      description: description,
      screenshot_url: screenshotUrl,
      location: `App: ${this.currentApp}, Window: ${this.currentWindowTitle}`,
    });

    // Notify employee if configured
    if (rule.notify_employee) {
      this.showNotification(rule, description);
    }
  }

  private showNotification(rule: ViolationRule, description: string) {
    try {
      new Notification({
        title: '⚠️ Violação de Política Detectada',
        body: `${description}\nSeveridade: ${this.getSeverityLabel(rule.severity)}`,
        urgency: rule.severity === 'critical' ? 'critical' : 'normal',
      }).show();
    } catch (e) {
      console.error('Failed to show notification:', e);
    }
  }

  private getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      critical: 'Crítica',
    };
    return labels[severity] || severity;
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
          this.currentWindowTitle = win.title || '';
          this.activeTime += elapsed;
          this.lastActivity = now;
          
          // Simulate keystroke counting based on activity
          // In production, use iohook for real keystroke counting
          const keyCount = Math.floor(Math.random() * 10);
          this.keystrokeCount += keyCount;
          
          // Simulate typed text for keyword detection
          // In production, capture real keystrokes
          if (keyCount > 0) {
            const simulatedChars = 'abcdefghijklmnopqrstuvwxyz ';
            for (let i = 0; i < keyCount; i++) {
              this.typedBuffer += simulatedChars[Math.floor(Math.random() * simulatedChars.length)];
            }
            
            // Check for blocked keywords in buffer
            await this.checkBlockedKeywords(this.typedBuffer);
          }
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
        globalShortcut.register(shortcut, async () => {
          console.log('Print screen blocked!');
          clipboard.clear();
          
          // Capture screenshot as evidence
          let screenshotUrl = '';
          try {
            const img = await screenshot.default({ format: 'png' });
            const filename = `printscreen_blocked_${uuidv4()}.png`;
            const tempPath = path.join(os.tmpdir(), filename);
            fs.writeFileSync(tempPath, img);
            screenshotUrl = `file://${tempPath}`;
          } catch (e) {
            console.error('Failed to capture evidence screenshot:', e);
          }
          
          await this.api.send('violation', {
            policy_name: 'Bloqueio de Print Screen',
            violation_type: 'print_screen',
            severity: 'medium',
            description: 'Tentativa de captura de tela bloqueada',
            screenshot_url: screenshotUrl,
            location: `App: ${this.currentApp}, Window: ${this.currentWindowTitle}`,
          });

          // Notify user
          new Notification({
            title: '⚠️ Print Screen Bloqueado',
            body: 'Capturas de tela não são permitidas neste dispositivo.',
          }).show();
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
      
      usbDetect.on('add', async (device: any) => {
        console.log('USB device connected:', device);
        
        // Capture screenshot as evidence
        let screenshotUrl = '';
        try {
          const img = await screenshot.default({ format: 'png' });
          const filename = `usb_violation_${uuidv4()}.png`;
          const tempPath = path.join(os.tmpdir(), filename);
          fs.writeFileSync(tempPath, img);
          screenshotUrl = `file://${tempPath}`;
        } catch (e) {
          console.error('Failed to capture evidence screenshot:', e);
        }
        
        await this.api.send('violation', {
          policy_name: 'Bloqueio de USB',
          violation_type: 'usb_connected',
          severity: 'high',
          description: `Dispositivo USB conectado: ${device.deviceName || 'Desconhecido'}`,
          screenshot_url: screenshotUrl,
          location: `App: ${this.currentApp}, Window: ${this.currentWindowTitle}`,
        });

        // Notify user
        new Notification({
          title: '⚠️ Dispositivo USB Detectado',
          body: 'Conexões USB não são permitidas neste dispositivo.',
          urgency: 'critical',
        }).show();
      });
    } catch (e) {
      console.log('USB monitoring not available:', e);
    }
  }
}
