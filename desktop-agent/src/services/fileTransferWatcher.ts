import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import log from 'electron-log';
import { CONFIG } from '../config';

/**
 * fileTransferWatcher
 * -------------------
 * Detecta movimentação de arquivos relevante para DLP e envia em lote para a
 * Edge Function `ingest-file-transfer`.
 *
 * Premissas explícitas (documentadas para auditoria):
 * - O veredito final é SEMPRE do servidor. O agente apenas reporta o fato;
 *   nunca decide sozinho que algo é "permitido".
 * - Hash SHA-256 é calculado somente até MAX_HASH_BYTES para não travar o
 *   agente com arquivos muito grandes; acima disso o hash é do prefixo e o
 *   metadado `hash_partial` sinaliza isso ao servidor.
 * - Deduplicação local por (caminho + tamanho + mtime) evita reenviar o mesmo
 *   evento quando o watcher dispara múltiplas vezes para uma única escrita.
 * - Falhas de I/O nunca derrubam o serviço: são logadas e o watcher continua.
 */

type Channel =
  | 'usb'
  | 'browser_upload'
  | 'browser_download'
  | 'cloud_sync'
  | 'email_attach'
  | 'network_share'
  | 'print';

interface TransferEvent {
  file_name: string;
  file_extension?: string;
  file_size_bytes: number;
  file_hash?: string;
  source_path?: string;
  destination_path?: string;
  channel: Channel;
  direction: 'in' | 'out';
  removable_device_label?: string;
  removable_device_serial?: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
}


/** Arquivos maiores que isto têm apenas o prefixo hasheado. */
const MAX_HASH_BYTES = 32 * 1024 * 1024;
/** Debounce por arquivo: escritas em rajada viram um único evento. */
const SETTLE_MS = 1500;
/** Intervalo de varredura de novas mídias removíveis. */
const MEDIA_SCAN_MS = 15_000;
/** Tamanho máximo do lote enviado por requisição. */
const BATCH_SIZE = 50;
const FLUSH_MS = 20_000;
/** Limite defensivo da fila local para não consumir memória sem limite. */
const MAX_QUEUE = 500;

export class FileTransferWatcher {
  private agentKey: string;
  private watchers = new Map<string, fs.FSWatcher>();
  private pending = new Map<string, NodeJS.Timeout>();
  private seen = new Set<string>();
  private queue: TransferEvent[] = [];
  private mediaTimer: NodeJS.Timeout | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private flushing = false;
  private running = false;

  constructor(agentKey: string) {
    this.agentKey = agentKey;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    for (const dir of this.staticDirectories()) {
      this.watchDirectory(dir.path, dir.channel, dir.direction);
    }

    this.scanRemovableMedia();
    this.mediaTimer = setInterval(() => this.scanRemovableMedia(), MEDIA_SCAN_MS);
    this.flushTimer = setInterval(() => void this.flush(), FLUSH_MS);

    log.info('File transfer watcher started');
  }

  stop(): void {
    this.running = false;
    for (const watcher of this.watchers.values()) {
      try {
        watcher.close();
      } catch (error) {
        log.warn('Failed to close file watcher:', error);
      }
    }
    this.watchers.clear();

    for (const timer of this.pending.values()) clearTimeout(timer);
    this.pending.clear();

    if (this.mediaTimer) clearInterval(this.mediaTimer);
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.mediaTimer = null;
    this.flushTimer = null;

    void this.flush();
    log.info('File transfer watcher stopped');
  }

  // ---------------------------------------------------------------- diretórios

  /** Downloads e pastas de sincronização em nuvem, por plataforma. */
  private staticDirectories(): Array<{ path: string; channel: Channel; direction: 'in' | 'out' }> {
    const home = os.homedir();
    const candidates: Array<{ path: string; channel: Channel; direction: 'in' | 'out' }> = [
      { path: path.join(home, 'Downloads'), channel: 'browser_download', direction: 'in' },
      { path: path.join(home, 'OneDrive'), channel: 'cloud_sync', direction: 'out' },
      { path: path.join(home, 'Dropbox'), channel: 'cloud_sync', direction: 'out' },
      { path: path.join(home, 'Google Drive'), channel: 'cloud_sync', direction: 'out' },
      { path: path.join(home, 'GoogleDrive'), channel: 'cloud_sync', direction: 'out' },
      { path: path.join(home, 'iCloudDrive'), channel: 'cloud_sync', direction: 'out' },
    ];

    return candidates.filter((c) => this.isDirectory(c.path));
  }

  private isDirectory(target: string): boolean {
    try {
      return fs.statSync(target).isDirectory();
    } catch {
      return false;
    }
  }

  private watchDirectory(
    dir: string,
    channel: Channel,
    direction: 'in' | 'out',
    deviceLabel: string | null = null,
  ): void {
    if (this.watchers.has(dir)) return;

    try {
      const watcher = fs.watch(dir, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        const fullPath = path.join(dir, filename.toString());
        this.scheduleEvent(fullPath, channel, direction, deviceLabel);
      });

      watcher.on('error', (error) => {
        log.warn(`Watcher error on ${dir}:`, error);
        this.watchers.delete(dir);
        try {
          watcher.close();
        } catch {
          /* já encerrado */
        }
      });

      this.watchers.set(dir, watcher);
      log.info(`Watching ${dir} (${channel}/${direction})`);
    } catch (error) {
      // `recursive: true` não é suportado em todos os sistemas de arquivos Linux.
      log.warn(`Unable to watch ${dir}:`, error);
    }
  }

  /** Detecta mídias removíveis montadas e passa a observá-las. */
  private scanRemovableMedia(): void {
    for (const mount of this.removableMounts()) {
      this.watchDirectory(mount, 'usb', 'out', path.basename(mount) || mount);
    }
  }

  private removableMounts(): string[] {
    const mounts: string[] = [];

    try {
      if (process.platform === 'darwin') {
        const base = '/Volumes';
        if (this.isDirectory(base)) {
          for (const entry of fs.readdirSync(base)) {
            const full = path.join(base, entry);
            if (this.isDirectory(full)) mounts.push(full);
          }
        }
      } else if (process.platform === 'linux') {
        for (const base of [`/media/${os.userInfo().username}`, '/media', '/run/media']) {
          if (!this.isDirectory(base)) continue;
          for (const entry of fs.readdirSync(base)) {
            const full = path.join(base, entry);
            if (this.isDirectory(full)) mounts.push(full);
          }
        }
      } else if (process.platform === 'win32') {
        // Letras de unidade acima de C: são tratadas como candidatas a removível.
        for (let code = 'D'.charCodeAt(0); code <= 'Z'.charCodeAt(0); code++) {
          const drive = `${String.fromCharCode(code)}:\\`;
          if (this.isDirectory(drive)) mounts.push(drive);
        }
      }
    } catch (error) {
      log.warn('Failed to enumerate removable media:', error);
    }

    return mounts;
  }

  // ------------------------------------------------------------------- eventos

  private scheduleEvent(
    fullPath: string,
    channel: Channel,
    direction: 'in' | 'out',
    deviceLabel: string | null,
  ): void {
    // Debounce: espera o arquivo "assentar" antes de hashear.
    const existing = this.pending.get(fullPath);
    if (existing) clearTimeout(existing);

    this.pending.set(
      fullPath,
      setTimeout(() => {
        this.pending.delete(fullPath);
        this.captureEvent(fullPath, channel, direction, deviceLabel);
      }, SETTLE_MS),
    );
  }

  private captureEvent(
    fullPath: string,
    channel: Channel,
    direction: 'in' | 'out',
    deviceLabel: string | null,
  ): void {
    let stats: fs.Stats;
    try {
      stats = fs.statSync(fullPath);
    } catch {
      return; // arquivo removido ou temporário — nada a reportar
    }

    if (!stats.isFile() || stats.size === 0) return;

    const baseName = path.basename(fullPath);
    // Ignora artefatos temporários de download/sincronização.
    if (/\.(crdownload|part|tmp|partial)$/i.test(baseName) || baseName.startsWith('~$')) return;

    const dedupeKey = `${fullPath}|${stats.size}|${stats.mtimeMs}`;
    if (this.seen.has(dedupeKey)) return;
    this.seen.add(dedupeKey);
    if (this.seen.size > 5000) this.seen.clear();

    const { hash, partial } = this.hashFile(fullPath, stats.size);
    const extension = path.extname(baseName).replace('.', '').toLowerCase() || null;

    // O schema do servidor usa campos opcionais (não nuláveis): chaves sem
    // valor são omitidas em vez de enviadas como null.
    const event: TransferEvent = {
      file_name: baseName,
      file_size_bytes: stats.size,
      destination_path: direction === 'out' ? deviceLabel ?? fullPath : fullPath,
      channel,
      direction,
      occurred_at: new Date(stats.mtimeMs).toISOString(),
      metadata: {
        hostname: os.hostname(),
        platform: process.platform,
        hash_partial: partial,
      },
    };
    if (extension) event.file_extension = extension;
    if (hash) event.file_hash = hash;
    if (direction === 'out') event.source_path = fullPath;
    if (channel === 'usb' && deviceLabel) event.removable_device_label = deviceLabel;

    this.enqueue(event);

  }

  private hashFile(fullPath: string, size: number): { hash: string | null; partial: boolean } {
    try {
      const partial = size > MAX_HASH_BYTES;
      const hasher = crypto.createHash('sha256');
      const fd = fs.openSync(fullPath, 'r');
      try {
        const chunk = Buffer.alloc(1024 * 1024);
        let read = 0;
        const limit = partial ? MAX_HASH_BYTES : size;
        while (read < limit) {
          const bytes = fs.readSync(fd, chunk, 0, Math.min(chunk.length, limit - read), read);
          if (bytes <= 0) break;
          hasher.update(chunk.subarray(0, bytes));
          read += bytes;
        }
      } finally {
        fs.closeSync(fd);
      }
      return { hash: hasher.digest('hex'), partial };
    } catch (error) {
      log.warn(`Failed to hash ${fullPath}:`, error);
      return { hash: null, partial: false };
    }
  }

  // --------------------------------------------------------------------- envio

  private enqueue(event: TransferEvent): void {
    this.queue.push(event);
    if (this.queue.length > MAX_QUEUE) this.queue = this.queue.slice(-MAX_QUEUE);
    if (this.queue.length >= BATCH_SIZE) void this.flush();
  }

  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;

    const batch = this.queue.splice(0, BATCH_SIZE);
    try {
      const response = await fetch(`${CONFIG.API_URL}/ingest-file-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-key': this.agentKey,
        },
        body: JSON.stringify({ events: batch }),
      });

      if (!response.ok) {
        const text = await response.text();
        log.warn(`ingest-file-transfer responded ${response.status}: ${text}`);
        // 4xx de validação é permanente: descartar evita fila envenenada.
        if (response.status >= 500 || response.status === 429) {
          this.queue.unshift(...batch);
        }
      }
    } catch (error) {
      log.error('Network error sending file transfers:', error);
      this.queue.unshift(...batch);
    } finally {
      this.flushing = false;
    }
  }
}
