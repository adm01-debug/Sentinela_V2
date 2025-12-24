import { extractor, ExtractConfig } from './extractor';
import { transformer } from './transformer';
import { loader, LoadConfig } from './loader';
export interface PipelineConfig { name: string; extract: ExtractConfig; load: LoadConfig; schedule?: string; }
export interface PipelineResult { name: string; extracted: number; transformed: number; loaded: number; duration: number; success: boolean; }
export class ETLPipeline {
  private config: PipelineConfig;
  constructor(config: PipelineConfig) { this.config = config; }
  async run(): Promise<PipelineResult> { const start = Date.now(); const extracted = await extractor.extract(this.config.extract); const transformed = transformer.transform(extracted.data); const loaded = await loader.load(this.config.load, transformed); return { name: this.config.name, extracted: extracted.count, transformed: transformed.length, loaded: loaded.loaded, duration: Date.now() - start, success: loaded.failed === 0 }; }
}
export const createPipeline = (config: PipelineConfig) => new ETLPipeline(config);
