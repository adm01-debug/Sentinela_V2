export interface SanitizeConfig { allowedTags: string[]; allowedAttributes: Record<string, string[]>; stripScripts: boolean; }
export interface XSSDetection { detected: boolean; type?: XSSType; payload?: string; location?: string; }
export type XSSType = 'reflected' | 'stored' | 'dom' | 'mutation';