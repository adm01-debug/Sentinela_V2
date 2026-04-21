import log from 'electron-log';
import { clipboard } from 'electron';
import { CONFIG } from '../../config';
import { dlpEngine, DLPScanResult } from './dlpEngine';

// ============================================================
// Clipboard DLP — intercepta texto copiado e bloqueia se sensível
// ============================================================

const POLL_INTERVAL_MS = 500;

export class ClipboardDLP {
  private agentKey: string;
  private timer: NodeJS.Timeout | null = null;
  private lastHash = '';

  constructor(agentKey: string) {
    this.agentKey = agentKey;
  }

  start(): void {
    log.info('Clipboard DLP started');
    this.timer = setInterval(() => this.tick(), POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    log.info('Clipboard DLP stopped');
  }

  private hash(s: string): string {
    // Lightweight FNV-1a — avoids importing crypto for a 32-bit dedupe key
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(16);
  }

  private tick(): void {
    try {
      if (!dlpEngine.hasPolicies()) return;

      const text = clipboard.readText();
      if (!text || text.length === 0) {
        this.lastHash = '';
        return;
      }

      const h = this.hash(text);
      if (h === this.lastHash) return;
      this.lastHash = h;

      const result = dlpEngine.scan(text, 'clipboard');
      if (!result.matched) return;

      this.handleMatch(text, result);
    } catch (err) {
      log.debug('Clipboard DLP tick error', err);
    }
  }

  private handleMatch(text: string, result: DLPScanResult): void {
    log.warn(
      `DLP clipboard match: ${result.matches.length} hits, ` +
      `severity=${result.highestSeverity}, action=${result.highestAction}`
    );

    if (result.highestAction === 'block' || result.highestAction === 'redact') {
      clipboard.clear();
      this.lastHash = '';
    }

    // Group matches by classifier for compact payload
    const byClassifier = new Map<string, number>();
    for (const m of result.matches) {
      byClassifier.set(m.classifier_code, (byClassifier.get(m.classifier_code) || 0) + 1);
    }
    const summary = Array.from(byClassifier.entries())
      .map(([code, count]) => `${code}:${count}`)
      .join(', ');

    const payload = {
      source_type: 'clipboard',
      action_taken: result.highestAction,
      severity: result.highestSeverity,
      match_count: result.matches.length,
      match_summary: summary,
      classifiers: Array.from(byClassifier.keys()),
      policy_ids: Array.from(new Set(result.matches.map((m) => m.policy_id).filter(Boolean))),
      metadata: { text_length: text.length },
      detected_at: new Date().toISOString(),
    };

    fetch(`${CONFIG.API_URL}/dlp-incident-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': this.agentKey,
      },
      body: JSON.stringify(payload),
    }).catch((err) => log.warn('DLP incident report failed', err));
  }
}
