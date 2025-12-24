export interface BundleAnalysis { totalSize: number; chunks: { name: string; size: number }[]; suggestions: string[]; }
export class BundleOptimizer {
  analyze(manifest: Record<string, number>): BundleAnalysis { const chunks = Object.entries(manifest).map(([name, size]) => ({ name, size })); const totalSize = chunks.reduce((sum, c) => sum + c.size, 0); const suggestions: string[] = []; const largeChunks = chunks.filter(c => c.size > 250000); if (largeChunks.length) suggestions.push('Split large chunks: ' + largeChunks.map(c => c.name).join(', ')); if (totalSize > 1000000) suggestions.push('Consider code splitting'); return { totalSize, chunks, suggestions }; }
  suggestSplitPoints(dependencies: string[]): string[] { const heavyLibs = ['moment', 'lodash', 'chart.js', 'd3']; return dependencies.filter(d => heavyLibs.some(h => d.includes(h))); }
}
export const bundleOptimizer = new BundleOptimizer();
