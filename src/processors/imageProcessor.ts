export class ImageProcessor {
  async resize(file: File, maxWidth: number, maxHeight: number): Promise<Blob> { const img = await this.loadImage(file); const canvas = document.createElement('canvas'); let { width, height } = img; if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; } if (height > maxHeight) { width = (width * maxHeight) / height; height = maxHeight; } canvas.width = width; canvas.height = height; canvas.getContext('2d')!.drawImage(img, 0, 0, width, height); return new Promise(r => canvas.toBlob(b => r(b!), 'image/jpeg', 0.9)); }
  private loadImage(file: File): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = URL.createObjectURL(file); }); }
  async toBase64(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(file); }); }
}
export const imageProcessor = new ImageProcessor();
