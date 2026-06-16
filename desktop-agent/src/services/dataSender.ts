import log from "electron-log";
import { app } from "electron";
import { CONFIG } from "../config";

interface QueueItem {
  data_type: string;
  data: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

export class DataSender {
  private agentKey: string;
  private queue: QueueItem[] = [];
  private sending = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(agentKey: string) {
    this.agentKey = agentKey;
    this.startFlushTimer();
  }

  send(dataType: string, data: Record<string, unknown>): void {
    this.queue.push({
      data_type: dataType,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    });

    // Flush immediately for critical data
    if (["screenshot", "login", "logout"].includes(dataType)) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, CONFIG.BATCH_SEND_INTERVAL_MS);
  }

  async flush(): Promise<void> {
    if (this.sending || this.queue.length === 0) return;
    this.sending = true;

    const batch = this.queue.splice(0, 50);
    const failed: QueueItem[] = [];

    for (const item of batch) {
      try {
        const response = await fetch(`${CONFIG.API_URL}/agent-collector`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-agent-key": this.agentKey,
          },
          body: JSON.stringify({
            data_type: item.data_type,
            data: item.data,
            timestamp: item.timestamp,
            agent_version: app.getVersion(),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          log.warn(`Failed to send ${item.data_type}: ${response.status} - ${errorText}`);

          if (response.status !== 400 && item.retries < CONFIG.MAX_RETRIES) {
            item.retries++;
            failed.push(item);
          }
        }
      } catch (error) {
        log.error(`Network error sending ${item.data_type}:`, error);
        if (item.retries < CONFIG.MAX_RETRIES) {
          item.retries++;
          failed.push(item);
        }
      }
    }

    // Re-queue failed items
    this.queue.unshift(...failed);

    // Trim queue if too large
    if (this.queue.length > CONFIG.LOCAL_CACHE_MAX_ITEMS) {
      this.queue = this.queue.slice(-CONFIG.LOCAL_CACHE_MAX_ITEMS);
    }

    this.sending = false;
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
