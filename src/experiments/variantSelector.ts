export interface VariantWeight { variant: string; weight: number; }
export class VariantSelector {
  selectRandom(variants: string[]): string { return variants[Math.floor(Math.random() * variants.length)]; }
  selectWeighted(variants: VariantWeight[]): string { const total = variants.reduce((sum, v) => sum + v.weight, 0); let random = Math.random() * total; for (const v of variants) { random -= v.weight; if (random <= 0) return v.variant; } return variants[0].variant; }
  selectByUserId(variants: string[], userId: string): string { let hash = 0; for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash) + userId.charCodeAt(i); return variants[Math.abs(hash) % variants.length]; }
}
export const variantSelector = new VariantSelector();
