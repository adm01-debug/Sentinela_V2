export interface ACLConfig {
  name: string;
  sourceSystem: string;
  targetSystem: string;
  translators: TranslatorConfig[];
}

export interface TranslatorConfig {
  sourceType: string;
  targetType: string;
  bidirectional: boolean;
}

export interface TranslationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

export interface ExternalModel {
  [key: string]: unknown;
}

export interface DomainModel {
  [key: string]: unknown;
}

export interface TranslationContext {
  sourceSystem: string;
  targetSystem: string;
  timestamp: Date;
  correlationId?: string;
}