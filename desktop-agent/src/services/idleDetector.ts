import log from 'electron-log';
import { powerMonitor } from 'electron';
import { CONFIG } from '../config';
import { DataSender } from './dataSender';

export class IdleDetector {
  private dataSender: DataSender;
  private pollTimer: NodeJS.Timeout | null = null;
  private wasIdle = false;
  private idleStart: Date | null = null;

  constructor(dataSender: DataSender) {
    this.dataSender = dataSender;
  }

  start(): void {
    log.info('Idle detector started');

    this.pollTimer = setInterval(() => {
      const idleSeconds = powerMonitor.getSystemIdleTime();

      if (idleSeconds >= CONFIG.IDLE_THRESHOLD_SECONDS && !this.wasIdle) {
        this.wasIdle = true;
        this.idleStart = new Date();
        log.debug(`User went idle (${idleSeconds}s)`);
      } else if (idleSeconds < CONFIG.IDLE_THRESHOLD_SECONDS && this.wasIdle) {
        // User came back
        const idleDuration = this.idleStart
          ? Math.round((Date.now() - this.idleStart.getTime()) / 1000)
          : idleSeconds;

        this.dataSender.send('idle', {
          duration_seconds: idleDuration,
        });

        this.wasIdle = false;
        this.idleStart = null;
        log.debug(`User returned from idle (was idle ${idleDuration}s)`);
      }
    }, 15000); // Check every 15 seconds

    // System suspend/resume
    powerMonitor.on('suspend', () => {
      log.info('System suspended');
      this.dataSender.send('idle', { duration_seconds: 0 });
    });

    powerMonitor.on('resume', () => {
      log.info('System resumed');
    });
  }

  stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    log.info('Idle detector stopped');
  }
}
