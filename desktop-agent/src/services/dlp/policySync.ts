import log from 'electron-log';
import { CONFIG } from '../../config';
import { dlpEngine, DLPClassifier, DLPPolicy } from './dlpEngine';

// ============================================================
// Policy Sync — pulls active policies + classifiers periodically
// ============================================================

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 min

export class PolicySync {
  private agentKey: string;
  private timer: NodeJS.Timeout | null = null;

  constructor(agentKey: string) {
    this.agentKey = agentKey;
  }

  async start(): Promise<void> {
    await this.refresh();
    this.timer = setInterval(() => {
      this.refresh().catch((err) => log.warn('DLP policy refresh failed', err));
    }, REFRESH_INTERVAL_MS);
    log.info('DLP policy sync started');
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async refresh(): Promise<void> {
    try {
      const res = await fetch(`${CONFIG.API_URL}/dlp-policy-sync`, {
        method: 'GET',
        headers: {
          'x-agent-key': this.agentKey,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        log.warn(`DLP policy sync HTTP ${res.status}`);
        return;
      }
      const json = (await res.json()) as {
        classifiers: DLPClassifier[];
        policies: DLPPolicy[];
      };
      dlpEngine.loadClassifiers(json.classifiers || []);
      dlpEngine.loadPolicies(json.policies || []);
      log.info(
        `DLP loaded: ${json.classifiers?.length || 0} classifiers, ${json.policies?.length || 0} policies`
      );
    } catch (err) {
      log.warn('DLP policy sync error', err);
    }
  }
}
