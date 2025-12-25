/**
 * @fileoverview Image Registry
 * @module @sentinela/core/imageRegistry
 */
export interface Image { name: string; tag: string; digest: string; size: number; }
export class ImageRegistry {
  private images = new Map<string, Image[]>();
  constructor(private config: { url: string }) {}
  async push(image: Image): Promise<void> {
    const imgs = this.images.get(image.name) ?? [];
    imgs.push(image);
    this.images.set(image.name, imgs);
  }
  async list(): Promise<string[]> { return Array.from(this.images.keys()); }
  async getTags(name: string): Promise<string[]> { return (this.images.get(name) ?? []).map(i => i.tag); }
}
