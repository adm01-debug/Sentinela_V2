export class GzipCompression {
  async compress(data: string): Promise<Uint8Array> { const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('gzip')); const reader = stream.getReader(); const chunks: Uint8Array[] = []; while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); } return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], [] as number[])); }
  async decompress(data: Uint8Array): Promise<string> { const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip')); const reader = stream.getReader(); const chunks: Uint8Array[] = []; while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); } return new TextDecoder().decode(new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], [] as number[]))); }
}
export const gzipCompression = new GzipCompression();
