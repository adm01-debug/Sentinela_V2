import { gzipCompression } from './gzipCompression';
import { imageCompression } from './imageCompression';
export type CompressionType = 'gzip' | 'brotli' | 'image';
export class CompressionService {
  async compress(data: string | File, type: CompressionType = 'gzip'): Promise<Uint8Array | Blob> { if (type === 'image' && data instanceof File) return imageCompression.compress(data); if (typeof data === 'string') return gzipCompression.compress(data); throw new Error('Invalid input'); }
  async decompress(data: Uint8Array): Promise<string> { return gzipCompression.decompress(data); }
  estimateSize(data: string): number { return new Blob([data]).size; }
}
export const compressionService = new CompressionService();
