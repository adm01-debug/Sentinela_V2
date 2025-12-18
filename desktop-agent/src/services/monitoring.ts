import { globalShortcut, clipboard, Notification, BrowserWindow, screen } from 'electron';
import * as activeWin from 'active-win';
import * as screenshot from 'screenshot-desktop';
import { Config } from '../config';
import { ApiService, ViolationRule, ScheduleResponse } from './api';
import { SmartBlurService } from './smartblur';
import { GeofencingService } from './geofencing';
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
  private blockWindow: BrowserWindow | null = null;
  private isBlocked = false;
  private lastScheduleCheck: ScheduleResponse | null = null;
  private onBlockStatusChange: ((blocked: boolean, reason: string) => void) | null = null;

  // Geofencing
  private geofencingService: GeofencingService | null = null;

  // Mouse Jiggler Detection
  private mousePositions: { x: number; y: number; time: number }[] = [];
  private lastVpnCheck: boolean = false;
  private jigglerDetected: boolean = false;

  // Apps categorized
  private productiveApps = ['code', 'visual studio', 'excel', 'word', 'powerpoint', 'outlook', 'teams', 'slack', 'notion', 'figma'];
  private unproductiveApps = ['youtube', 'netflix', 'spotify', 'instagram', 'facebook', 'twitter', 'tiktok', 'games'];

  constructor(config: Config, api: ApiService) {
    this.config = config;
    this.api = api;
  }

  setBlockStatusCallback(callback: (blocked: boolean, reason: string) => void) {
    this.onBlockStatusChange = callback;
  }

  async start() {
    console.log('MonitoringService starting...');

    // Configure SmartBlur whitelist
    SmartBlurService.setConfig({
      whitelist: this.config.smartBlurWhitelist || [],
      whitelistApps: this.config.smartBlurWhitelistApps || [],
    });

    // Fetch violation rules on start
    await this.refreshRules();

    // Refresh rules every 5 minutes
    this.intervals.push(setInterval(() => this.refreshRules(), 5 * 60 * 1000));

    // Heartbeat every minute
    this.intervals.push(setInterval(() => this.api.heartbeat(), 60000));

    // Start schedule checking (checks every 30 seconds)
    this.startScheduleChecking();

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

    // VPN Detection
    if (this.config.vpnDetectionEnabled) {
      this.startVpnDetection();
    }

    // Mouse Jiggler Detection
    if (this.config.mouseJigglerDetectionEnabled) {
      this.startMouseJigglerDetection();
    }

    // Geofencing
    if (this.config.geofencingEnabled) {
      this.startGeofencingCheck();
    }

    // Start violation rule checking
    this.startViolationChecking();

    console.log('MonitoringService started');
  }

  async stop() {
    console.log('MonitoringService stopping...');
    this.intervals.forEach(interval => clearInterval(interval));
    globalShortcut.unregisterAll();
    this.closeBlockWindow();
    
    // Cleanup SmartBlur OCR worker
    await SmartBlurService.cleanup();
  }

  // ========== Geofencing Check ==========

  private startGeofencingCheck() {
    this.geofencingService = new GeofencingService(this.config);

    // Check geofence immediately and then every 60 seconds
    const checkGeofence = async () => {
      if (!this.geofencingService) return;

      const result = await this.geofencingService.checkGeofence();
      if (result && !result.allowed) {
        console.log(`[Geofencing] Violation: ${result.message}`);

        // If should_block is set, show block screen
        if (result.should_block && !this.isBlocked) {
          this.showBlockScreen(`Fora da área permitida: ${result.nearest_geofence || 'Geofence'}`);
        }
      }
    };

    checkGeofence();
    this.intervals.push(setInterval(checkGeofence, 60000));
  }
  }

  private async refreshRules() {
    this.violationRules = await this.api.fetchViolationRules();
    console.log(`Loaded ${this.violationRules.length} active violation rules`);
  }

  // ========== Schedule-based Station Blocking ==========

  private async startScheduleChecking() {
    // Check schedule immediately on start
    await this.checkScheduleAndBlock();

    // Check every 30 seconds
    const scheduleInterval = setInterval(async () => {
      await this.checkScheduleAndBlock();
    }, 30 * 1000);

    this.intervals.push(scheduleInterval);
  }

  private async checkScheduleAndBlock() {
    try {
      const scheduleResponse = await this.api.fetchEmployeeSchedule();
      this.lastScheduleCheck = scheduleResponse;

      if (scheduleResponse.block_station && !this.isBlocked) {
        // Should block but not currently blocked
        this.showBlockScreen(scheduleResponse.reason);
      } else if (!scheduleResponse.block_station && this.isBlocked) {
        // Should unblock
        this.closeBlockWindow();
      }

      // Notify callback if registered
      if (this.onBlockStatusChange) {
        this.onBlockStatusChange(scheduleResponse.block_station, scheduleResponse.reason);
      }
    } catch (error) {
      console.error('Error checking schedule:', error);
    }
  }

  private showBlockScreen(reason: string) {
    if (this.blockWindow) {
      return; // Already showing
    }

    this.isBlocked = true;
    console.log('Blocking station:', reason);

    // Get primary display dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    this.blockWindow = new BrowserWindow({
      width: width,
      height: height,
      x: 0,
      y: 0,
      fullscreen: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: true,
      kiosk: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Create HTML content for block screen
    const htmlContent = this.createBlockScreenHtml(reason);
    this.blockWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Keep window on top and prevent alt+f4
    this.blockWindow.setAlwaysOnTop(true, 'screen-saver');
    
    this.blockWindow.on('close', (e) => {
      if (this.isBlocked) {
        e.preventDefault(); // Prevent closing while blocked
      }
    });

    // Focus the block window
    this.blockWindow.focus();

    // Notify about blocking
    new Notification({
      title: '🔒 Estação Bloqueada',
      body: reason,
      urgency: 'critical',
    }).show();

    // Send violation report
    this.api.send('violation', {
      policy_name: 'Bloqueio de Jornada',
      violation_type: 'work_hours',
      severity: 'medium',
      description: `Estação bloqueada: ${reason}`,
      screenshot_url: '',
      location: `Device: ${this.config.deviceName}`,
    });
  }

  private createBlockScreenHtml(reason: string): string {
    const scheduleInfo = this.lastScheduleCheck?.schedule;
    const scheduleDetails = scheduleInfo 
      ? `Horário: ${scheduleInfo.start_time} - ${scheduleInfo.end_time}` 
      : '';
    const allowOvertime = scheduleInfo?.allow_overtime ?? true;
    const overtimeUrl = this.config.serverUrl.replace('/agent-collector', '/request-overtime');
    const employeeName = this.config.employeeName;
    const agentKey = this.config.agentKey;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: linear-gradient(135deg, #1e1e2e 0%, #2d1b4e 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          user-select: none;
        }
        .container {
          text-align: center;
          padding: 40px 60px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          max-width: 650px;
          width: 90%;
        }
        .lock-icon {
          font-size: 60px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        h1 {
          font-size: 32px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        .reason {
          font-size: 18px;
          color: #ff6b6b;
          margin-bottom: 20px;
          padding: 12px 20px;
          background: rgba(255,107,107,0.1);
          border-radius: 10px;
          border: 1px solid rgba(255,107,107,0.3);
        }
        .schedule-info {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 20px;
        }
        .message {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 25px;
        }
        .company {
          margin-top: 30px;
          font-size: 11px;
          color: #475569;
        }
        .time {
          font-size: 42px;
          font-weight: 300;
          margin-bottom: 8px;
          color: #a78bfa;
        }
        
        /* Overtime Request Form */
        .overtime-section {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .overtime-title {
          font-size: 16px;
          color: #a78bfa;
          margin-bottom: 15px;
          font-weight: 500;
        }
        .form-group {
          margin-bottom: 15px;
          text-align: left;
        }
        .form-group label {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 5px;
        }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-family: inherit;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          outline: none;
          border-color: #a78bfa;
          background: rgba(255,255,255,0.1);
        }
        .form-group textarea {
          min-height: 60px;
          resize: none;
        }
        .form-group select option {
          background: #1e1e2e;
          color: white;
        }
        .form-row {
          display: flex;
          gap: 15px;
        }
        .form-row .form-group {
          flex: 1;
        }
        .btn-request {
          width: 100%;
          padding: 12px 20px;
          background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }
        .btn-request:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(139,92,246,0.4);
        }
        .btn-request:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .status-message {
          margin-top: 15px;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 13px;
          display: none;
        }
        .status-message.success {
          display: block;
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          color: #22c55e;
        }
        .status-message.error {
          display: block;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
        }
        .status-message.pending {
          display: block;
          background: rgba(234,179,8,0.15);
          border: 1px solid rgba(234,179,8,0.3);
          color: #eab308;
        }
        .no-overtime {
          font-size: 13px;
          color: #94a3b8;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="lock-icon">🔒</div>
        <div class="time" id="currentTime"></div>
        <h1>Estação Bloqueada</h1>
        <div class="reason">${reason}</div>
        <div class="schedule-info">${scheduleDetails}</div>
        <p class="message">
          Esta estação de trabalho está bloqueada fora do horário permitido.
        </p>
        
        ${allowOvertime ? `
        <div class="overtime-section">
          <div class="overtime-title">📝 Solicitar Hora Extra</div>
          <form id="overtimeForm" onsubmit="submitOvertimeRequest(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Horas solicitadas</label>
                <select id="hoursRequested">
                  <option value="1">1 hora</option>
                  <option value="2" selected>2 horas</option>
                  <option value="3">3 horas</option>
                  <option value="4">4 horas</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Motivo da solicitação</label>
              <textarea id="overtimeReason" placeholder="Descreva o motivo pelo qual precisa trabalhar fora do horário..." maxlength="500"></textarea>
            </div>
            <button type="submit" class="btn-request" id="submitBtn">
              Enviar Solicitação
            </button>
          </form>
          <div id="statusMessage" class="status-message"></div>
        </div>
        ` : `
        <div class="overtime-section">
          <p class="no-overtime">Solicitações de hora extra não estão habilitadas para sua jornada.<br>Entre em contato com seu gestor para liberação.</p>
        </div>
        `}
        
        <p class="company">SecureWatch • Monitoramento de Segurança</p>
      </div>
      <script>
        const overtimeUrl = '${overtimeUrl}';
        const employeeName = '${employeeName}';
        const agentKey = '${agentKey}';
        
        function updateTime() {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          document.getElementById('currentTime').textContent = timeStr;
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        // Disable most keyboard shortcuts but allow typing in form
        document.addEventListener('keydown', (e) => {
          // Allow typing in form fields
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            // Only block dangerous shortcuts
            if (e.altKey && e.key === 'F4') {
              e.preventDefault();
              return false;
            }
            return true;
          }
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
        
        async function submitOvertimeRequest(event) {
          event.preventDefault();
          
          const submitBtn = document.getElementById('submitBtn');
          const statusMessage = document.getElementById('statusMessage');
          const reason = document.getElementById('overtimeReason').value.trim();
          const hours = parseInt(document.getElementById('hoursRequested').value);
          
          if (!reason) {
            statusMessage.className = 'status-message error';
            statusMessage.textContent = 'Por favor, informe o motivo da solicitação.';
            return;
          }
          
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';
          statusMessage.className = 'status-message pending';
          statusMessage.textContent = 'Processando solicitação...';
          
          try {
            const response = await fetch(overtimeUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                employee_name: employeeName,
                agent_key: agentKey,
                reason: reason,
                hours_requested: hours
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              statusMessage.className = 'status-message success';
              statusMessage.textContent = '✓ Solicitação enviada com sucesso! Aguarde aprovação do seu gestor.';
              document.getElementById('overtimeForm').style.display = 'none';
            } else {
              statusMessage.className = 'status-message error';
              statusMessage.textContent = result.error || 'Falha ao enviar solicitação. Tente novamente.';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Enviar Solicitação';
            }
          } catch (error) {
            statusMessage.className = 'status-message error';
            statusMessage.textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Solicitação';
          }
        }
      </script>
    </body>
    </html>
    `;
      <script>
        function updateTime() {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          document.getElementById('currentTime').textContent = timeStr;
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        // Disable keyboard shortcuts
        document.addEventListener('keydown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        });
      </script>
    </body>
    </html>
    `;
  }

  private closeBlockWindow() {
    if (this.blockWindow) {
      this.isBlocked = false;
      this.blockWindow.destroy();
      this.blockWindow = null;
      console.log('Station unblocked');

      new Notification({
        title: '🔓 Estação Desbloqueada',
        body: 'Você pode continuar usando a estação de trabalho.',
      }).show();
    }
  }

  getBlockStatus(): { isBlocked: boolean; reason: string; schedule: any } {
    return {
      isBlocked: this.isBlocked,
      reason: this.lastScheduleCheck?.reason || '',
      schedule: this.lastScheduleCheck?.schedule || null,
    };
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
        const windowTitle = win?.title || '';
        const appName = win?.owner.name || 'Desktop';
        
        // Apply SmartBlur to hide sensitive data (if enabled)
        let finalPath = tempPath;
        let blurApplied = false;
        
        if (this.config.smartBlurEnabled !== false) {
          try {
            const blurResult = await SmartBlurService.processImage(
              tempPath,
              windowTitle,
              appName
            );
            
            finalPath = blurResult.processedPath;
            blurApplied = blurResult.regionsBlurred > 0;
            
            if (blurApplied) {
              console.log(`SmartBlur applied: ${blurResult.regionsBlurred} regions (${blurResult.sensitiveTypes.join(', ')})`);
            }
          } catch (blurError) {
            console.error('SmartBlur error:', blurError);
            // Continue with original image if blur fails
          }
        }
        
        // In production, upload to storage and get URL
        const captureUrl = `file://${finalPath}`;
        
        await this.api.send('screenshot', {
          capture_url: captureUrl,
          app_name: appName,
          window_title: windowTitle,
          captured_at: new Date().toISOString(),
          smartblur_applied: blurApplied,
        });

        console.log('Screenshot captured:', filename, blurApplied ? '(SmartBlur applied)' : '');
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

  // ========== VPN Detection ==========

  private startVpnDetection() {
    console.log('Starting VPN detection...');
    
    // Check immediately on start
    this.checkVpnConnection();
    
    // Check every 30 seconds
    const vpnInterval = setInterval(() => {
      this.checkVpnConnection();
    }, 30 * 1000);
    
    this.intervals.push(vpnInterval);
  }

  private async checkVpnConnection() {
    try {
      const networkInterfaces = os.networkInterfaces();
      const vpnIndicators = [
        'tun', 'tap', 'ppp', 'vpn', 'wg', 'wireguard', 
        'nordvpn', 'expressvpn', 'protonvpn', 'mullvad',
        'openvpn', 'ipsec', 'pptp', 'l2tp', 'zerotier',
        'tailscale', 'cloudflare', 'warp', 'utun'
      ];
      
      let vpnDetected = false;
      let vpnInterfaceName = '';
      
      for (const [name, interfaces] of Object.entries(networkInterfaces)) {
        const nameLower = name.toLowerCase();
        
        // Check if interface name matches VPN indicators
        for (const indicator of vpnIndicators) {
          if (nameLower.includes(indicator)) {
            vpnDetected = true;
            vpnInterfaceName = name;
            break;
          }
        }
        
        // Additional checks for active VPN connections
        if (interfaces) {
          for (const iface of interfaces) {
            // VPNs often use specific IP ranges
            if (iface.address?.startsWith('10.') && nameLower !== 'eth0' && nameLower !== 'en0') {
              // Could be a VPN tunnel
              if (!nameLower.includes('docker') && !nameLower.includes('vbox') && !nameLower.includes('vmware')) {
                vpnDetected = true;
                vpnInterfaceName = name;
              }
            }
          }
        }
        
        if (vpnDetected) break;
      }
      
      // Also check running processes for VPN applications
      if (!vpnDetected) {
        vpnDetected = await this.checkVpnProcesses();
      }
      
      // Only report if status changed
      if (vpnDetected && !this.lastVpnCheck) {
        console.log('VPN connection detected:', vpnInterfaceName);
        
        // Capture screenshot as evidence
        let screenshotUrl = '';
        try {
          const img = await screenshot.default({ format: 'png' });
          const filename = `vpn_detected_${uuidv4()}.png`;
          const tempPath = path.join(os.tmpdir(), filename);
          fs.writeFileSync(tempPath, img);
          screenshotUrl = `file://${tempPath}`;
        } catch (e) {
          console.error('Failed to capture evidence screenshot:', e);
        }
        
        await this.api.send('violation', {
          policy_name: 'Detecção de VPN',
          violation_type: 'vpn_detected',
          severity: 'high',
          description: `Conexão VPN detectada: ${vpnInterfaceName || 'Interface de rede suspeita'}`,
          screenshot_url: screenshotUrl,
          location: `Device: ${this.config.deviceName}`,
        });

        // Notify user
        new Notification({
          title: '⚠️ VPN Detectada',
          body: 'O uso de VPN não é permitido durante o expediente.',
          urgency: 'critical',
        }).show();
      }
      
      this.lastVpnCheck = vpnDetected;
    } catch (error) {
      console.error('Error checking VPN connection:', error);
    }
  }

  private async checkVpnProcesses(): Promise<boolean> {
    const vpnProcessNames = [
      'openvpn', 'wireguard', 'nordvpn', 'expressvpn', 
      'protonvpn', 'mullvad', 'surfshark', 'cyberghost',
      'privateinternetaccess', 'pia', 'tunnelbear', 'hotspotshield',
      'windscribe', 'ipvanish', 'purevpn', 'torguard',
      'cloudflare-warp', 'warp-cli', 'tailscale'
    ];
    
    try {
      // This would require a native module or exec to check running processes
      // For now, we'll just check common process names
      const { exec } = require('child_process');
      const platform = os.platform();
      
      return new Promise((resolve) => {
        let command = '';
        
        if (platform === 'win32') {
          command = 'tasklist /FO CSV';
        } else if (platform === 'darwin' || platform === 'linux') {
          command = 'ps aux';
        }
        
        if (!command) {
          resolve(false);
          return;
        }
        
        exec(command, (error: Error | null, stdout: string) => {
          if (error) {
            resolve(false);
            return;
          }
          
          const outputLower = stdout.toLowerCase();
          for (const processName of vpnProcessNames) {
            if (outputLower.includes(processName)) {
              resolve(true);
              return;
            }
          }
          
          resolve(false);
        });
      });
    } catch (e) {
      return false;
    }
  }

  // ========== Mouse Jiggler Detection ==========

  private startMouseJigglerDetection() {
    console.log('Starting Mouse Jiggler detection...');
    
    // Track mouse positions
    const trackInterval = setInterval(async () => {
      try {
        // Get current mouse position using Electron's screen API
        const point = screen.getCursorScreenPoint();
        const now = Date.now();
        
        this.mousePositions.push({ x: point.x, y: point.y, time: now });
        
        // Keep only the last 60 positions (1 minute at 1 sample/second)
        if (this.mousePositions.length > 60) {
          this.mousePositions.shift();
        }
        
        // Analyze for jiggler patterns
        if (this.mousePositions.length >= 30) {
          this.analyzeMousePatterns();
        }
      } catch (e) {
        // Ignore errors
      }
    }, 1000);
    
    this.intervals.push(trackInterval);
  }

  private async analyzeMousePatterns() {
    if (this.mousePositions.length < 30) return;
    
    const positions = this.mousePositions.slice(-30);
    
    // Calculate movement deltas
    const deltas: { dx: number; dy: number }[] = [];
    for (let i = 1; i < positions.length; i++) {
      deltas.push({
        dx: positions[i].x - positions[i-1].x,
        dy: positions[i].y - positions[i-1].y
      });
    }
    
    // Pattern 1: Check for perfectly regular small movements (physical jiggler)
    const smallMovements = deltas.filter(d => 
      Math.abs(d.dx) <= 5 && Math.abs(d.dy) <= 5 && 
      (Math.abs(d.dx) > 0 || Math.abs(d.dy) > 0)
    );
    
    // Pattern 2: Check for repetitive identical movements
    const movementCounts = new Map<string, number>();
    deltas.forEach(d => {
      const key = `${d.dx},${d.dy}`;
      movementCounts.set(key, (movementCounts.get(key) || 0) + 1);
    });
    
    // Find most common movement
    let maxCount = 0;
    movementCounts.forEach((count) => {
      if (count > maxCount) maxCount = count;
    });
    
    // Pattern 3: Check for alternating movements (back and forth)
    let alternatingCount = 0;
    for (let i = 2; i < deltas.length; i++) {
      if (
        Math.sign(deltas[i].dx) === -Math.sign(deltas[i-1].dx) &&
        Math.sign(deltas[i].dy) === -Math.sign(deltas[i-1].dy) &&
        Math.abs(deltas[i].dx) === Math.abs(deltas[i-1].dx) &&
        Math.abs(deltas[i].dy) === Math.abs(deltas[i-1].dy)
      ) {
        alternatingCount++;
      }
    }
    
    // Pattern 4: Check for circular patterns (software jigglers)
    let circularScore = 0;
    for (let i = 4; i < deltas.length; i++) {
      // Check if movements form a cycle
      if (
        Math.abs(deltas[i].dx - deltas[i-4].dx) < 2 &&
        Math.abs(deltas[i].dy - deltas[i-4].dy) < 2
      ) {
        circularScore++;
      }
    }
    
    // Detect jiggler based on patterns
    const isJiggler = 
      (smallMovements.length >= 25 && maxCount >= 10) || // Too many identical small movements
      (alternatingCount >= 10) || // Too many alternating movements
      (circularScore >= 15) || // Circular pattern detected
      (maxCount >= 20); // Same movement repeated too many times
    
    if (isJiggler && !this.jigglerDetected) {
      console.log('Mouse Jiggler detected!');
      console.log(`Patterns: small=${smallMovements.length}, maxRepeat=${maxCount}, alternating=${alternatingCount}, circular=${circularScore}`);
      
      this.jigglerDetected = true;
      
      // Capture screenshot as evidence
      let screenshotUrl = '';
      try {
        const img = await screenshot.default({ format: 'png' });
        const filename = `jiggler_detected_${uuidv4()}.png`;
        const tempPath = path.join(os.tmpdir(), filename);
        fs.writeFileSync(tempPath, img);
        screenshotUrl = `file://${tempPath}`;
      } catch (e) {
        console.error('Failed to capture evidence screenshot:', e);
      }
      
      await this.api.send('violation', {
        policy_name: 'Detecção de Mouse Jiggler',
        violation_type: 'mouse_jiggler',
        severity: 'critical',
        description: 'Dispositivo ou software simulador de atividade de mouse detectado. Padrões anormais de movimento identificados.',
        screenshot_url: screenshotUrl,
        location: `Device: ${this.config.deviceName}`,
      });

      // Notify user
      new Notification({
        title: '🚨 Mouse Jiggler Detectado',
        body: 'O uso de simuladores de atividade não é permitido.',
        urgency: 'critical',
      }).show();
      
      // Reset after 5 minutes to allow re-detection
      setTimeout(() => {
        this.jigglerDetected = false;
        this.mousePositions = [];
      }, 5 * 60 * 1000);
    }
  }
}
