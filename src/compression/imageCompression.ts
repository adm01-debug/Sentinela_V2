export class ImageCompression {
  async compress(file: File, quality = 0.8, maxWidth = 1920): Promise<Blob> { const img = await this.loadImage(file); const canvas = document.createElement('canvas'); let { width, height } = img; if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; } canvas.width = width; canvas.height = height; canvas.getContext('2d')!.drawImage(img, 0, 0, width, height); return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg', quality)); }
  private loadImage(file: File): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = URL.createObjectURL(file); }); }
  getCompressionRatio(original: number, compressed: number): number { return ((original - compressed) / original) * 100; }
}
export const imageCompression = new ImageCompression();
