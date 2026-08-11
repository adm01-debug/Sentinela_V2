import { desktopCapturer, app } from 'electron';
import log from 'electron-log';
import { CONFIG } from '../config';

interface PendingChunk {
  sequence: number;
  startedAt: string;
  durationSeconds: number;
  base64: string;
  sha256: string;
  appName?: string;
  windowTitle?: string;
  retries: number;
}

interface RecorderOptions {
  agentKey: string;
  /** Duração de cada trecho em segundos. */
  segmentSeconds?: number;
  reason?: string;
  consentAcknowledged?: boolean;
}

/**
 * Grava a tela em trechos curtos e os envia para `upload-recording-chunk`.
 *
 * Decisões de projeto:
 * - Segmentação: trechos independentes evitam perder a gravação inteira se o agente cair.
 * - Fila com retry: falhas de rede não descartam evidência; o backend deduplica por (sessão, sequência).
 * - Checksum local: o backend rejeita trechos corrompidos em trânsito.
 */
export class ScreenRecorder {
  private readonly agentKey: string;
  private readonly segmentSeconds: number;
  private readonly reason?: string;
  private readonly consentAcknowledged: boolean;

  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private sessionId: string | null = null;
  private sequence = 0;
  private segmentStartedAt = '';
  private queue: PendingChunk[] = [];
  private flushing = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(options: RecorderOptions) {
    this.agentKey = options.agentKey;
    this.segmentSeconds = options.segmentSeconds ?? 60;
    this.reason = options.reason;
    this.consentAcknowledged = options.consentAcknowledged ?? false;
  }

  async start(): Promise<void> {
    if (this.running) return;

    try {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      const source = sources[0];
      if (!source) {
        log.warn('ScreenRecorder: nenhuma tela disponível para captura');
        return;
      }

      // `mandatory` é a API do Chromium para capturar a tela pelo id da fonte.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            maxFrameRate: 8,
            maxWidth: 1280,
            maxHeight: 720,
          },
        },
      } as unknown as MediaStreamConstraints);

      this.recorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 800_000,
      });

      this.segmentStartedAt = new Date().toISOString();
      this.recorder.ondataavailable = (event: BlobEvent) => {
        void this.handleSegment(event.data);
      };
      this.recorder.onerror = (event: Event) => {
        log.error('ScreenRecorder: erro no MediaRecorder', event);
      };

      // timeslice faz o Chromium emitir um Blob completo a cada intervalo
      this.recorder.start(this.segmentSeconds * 1000);
      this.running = true;
      this.startFlushTimer();
      log.info('ScreenRecorder iniciado');
    } catch (error) {
      log.error('ScreenRecorder: falha ao iniciar', error);
      this.cleanupStream();
    }
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    try {
      this.recorder?.stop();
    } catch (error) {
      log.error('ScreenRecorder: falha ao parar gravação', error);
    }

    this.cleanupStream();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Drena a fila marcando o último trecho como final para fechar a sessão
    await this.flush(true);
    log.info('ScreenRecorder parado');
  }

  private cleanupStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;
  }

  private async handleSegment(blob: Blob): Promise<void> {
    if (!blob || blob.size === 0) return;

    try {
      const buffer = new Uint8Array(await blob.arrayBuffer());
      const digest = await crypto.subtle.digest('SHA-256', buffer);
      const sha256 = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      let appName: string | undefined;
      let windowTitle: string | undefined;
      try {
        const activeWin = await import('active-win');
        const win = await activeWin.default();
        appName = win?.owner?.name;
        windowTitle = win?.title;
      } catch {
        // active-win pode falhar em alguns sistemas; metadados são opcionais
      }

      this.queue.push({
        sequence: this.sequence++,
        startedAt: this.segmentStartedAt,
        durationSeconds: this.segmentSeconds,
        base64: Buffer.from(buffer).toString('base64'),
        sha256,
        appName,
        windowTitle,
        retries: 0,
      });

      this.segmentStartedAt = new Date().toISOString();

      // Limita o cache local para não crescer sem controle em quedas longas de rede
      if (this.queue.length > 60) {
        this.queue = this.queue.slice(-60);
        log.warn('ScreenRecorder: fila de trechos truncada por limite local');
      }

      void this.flush(false);
    } catch (error) {
      log.error('ScreenRecorder: falha ao processar trecho', error);
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      void this.flush(false);
    }, CONFIG.BATCH_SEND_INTERVAL_MS);
  }

  private async flush(finalize: boolean): Promise<void> {
    if (this.flushing) return;
    if (this.queue.length === 0 && !finalize) return;

    this.flushing = true;
    const failed: PendingChunk[] = [];

    while (this.queue.length > 0) {
      const chunk = this.queue.shift()!;
      const isLast = finalize && this.queue.length === 0;

      try {
        const response = await fetch(`${CONFIG.API_URL}/upload-recording-chunk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-agent-key': this.agentKey,
          },
          body: JSON.stringify({
            session_id: this.sessionId ?? undefined,
            sequence: chunk.sequence,
            started_at: chunk.startedAt,
            duration_seconds: chunk.durationSeconds,
            mime_type: 'video/webm',
            app_name: chunk.appName,
            window_title: chunk.windowTitle,
            sha256: chunk.sha256,
            chunk_base64: chunk.base64,
            reason: this.reason,
            consent_acknowledged: this.consentAcknowledged,
            device: app.getName(),
            final: isLast,
          }),
        });

        if (response.ok) {
          const body = (await response.json()) as { session_id?: string };
          if (body.session_id) this.sessionId = body.session_id;
          continue;
        }

        const errorText = await response.text();
        log.warn(`ScreenRecorder: upload falhou (${response.status}) - ${errorText}`);

        // 4xx de validação não se resolve com retry; só reagenda erros transitórios
        const retriable = response.status === 429 || response.status >= 500;
        if (retriable && chunk.retries < CONFIG.MAX_RETRIES) {
          chunk.retries++;
          failed.push(chunk);
        }
      } catch (error) {
        log.error('ScreenRecorder: erro de rede no upload', error);
        if (chunk.retries < CONFIG.MAX_RETRIES) {
          chunk.retries++;
          failed.push(chunk);
        }
      }
    }

    this.queue.unshift(...failed);
    this.flushing = false;
  }
}
