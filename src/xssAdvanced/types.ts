export interface SanitizerConfig { allowedTags: string[]; allowedAttributes: Record<string, string[]>; allowedProtocols: string[]; stripComments: boolean; }
export interface XSSDetectionResult { detected: boolean; patterns: DetectedPattern[]; riskLevel: 'low' | 'medium' | 'high' | 'critical'; }
export interface DetectedPattern { type: string; location: number; matched: string; }