import { promisify } from 'util';
import log from 'electron-log';
import { exec } from 'child_process';
import { DataSender } from './dataSender';

const execAsync = promisify(exec);

export class UsbBlockerService {
  private dataSender: DataSender;
  private pollTimer: NodeJS.Timeout | null = null;
  private blocked = false;

  constructor(dataSender: DataSender) {
    this.dataSender = dataSender;
  }

  start(): void {
    log.info('USB blocker service started');
    this.enableBlock();
    this.pollTimer = setInterval(() => this.monitorUsb(), 10000); // Check every 10s
  }

  async stop(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    await this.disableBlock();
    log.info('USB blocker service stopped');
  }

  private enableBlock(): void {
    if (process.platform !== 'win32') {
      log.warn('USB blocking only supported on Windows');
      return;
    }

    // Disable USB storage via Windows registry
    const command = 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v Start /t REG_DWORD /d 4 /f';
    
    exec(command, (error) => {
      if (error) {
        log.error('Failed to enable USB block:', error.message);
      } else {
        this.blocked = true;
        log.info('USB storage devices blocked via registry');
      }
    });
  }

  private async disableBlock(): Promise<void> {
    if (process.platform !== 'win32') return;

    const command = 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v Start /t REG_DWORD /d 3 /f';

    try {
      await execAsync(command);
      this.blocked = false;
      log.info('USB storage devices unblocked');
    } catch (error) {
      log.error('Failed to disable USB block:', (error as Error).message);
    }
  }

  private monitorUsb(): void {
    if (process.platform !== 'win32') return;

    // Check if USB devices were connected
    const command = 'wmic logicaldisk where drivetype=2 get caption,volumename';
    
    exec(command, (error, stdout) => {
      if (error) return;

      const lines = stdout.trim().split('\n').slice(1).filter(l => l.trim());
      
      if (lines.length > 0) {
        for (const line of lines) {
          const drive = line.trim();
          if (drive) {
            log.warn(`USB device detected: ${drive}`);
            
            this.dataSender.send('activity', {
              active_window: `USB_VIOLATION: ${drive}`,
              keystrokes: 0,
              idle_time: 0,
            });
          }
        }
      }
    });
  }
}
