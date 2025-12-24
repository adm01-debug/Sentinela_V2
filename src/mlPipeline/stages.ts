import { PipelineStage, StageType } from './types';

export class StageBuilder {
  static dataIngestion(name: string, source: string): Omit<PipelineStage, 'id'> {
    return { name, type: 'data_ingestion', config: { source } };
  }
  
  static preprocessing(name: string, operations: string[]): Omit<PipelineStage, 'id'> {
    return { name, type: 'preprocessing', config: { operations } };
  }
  
  static featureEngineering(name: string, features: string[]): Omit<PipelineStage, 'id'> {
    return { name, type: 'feature_engineering', config: { features } };
  }
  
  static training(name: string, algorithm: string, params: Record<string, unknown>): Omit<PipelineStage, 'id'> {
    return { name, type: 'training', config: { algorithm, params } };
  }
  
  static evaluation(name: string, metrics: string[]): Omit<PipelineStage, 'id'> {
    return { name, type: 'evaluation', config: { metrics } };
  }
  
  static deployment(name: string, target: string): Omit<PipelineStage, 'id'> {
    return { name, type: 'deployment', config: { target } };
  }
}