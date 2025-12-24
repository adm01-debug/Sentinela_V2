import { SanitizeConfig } from './types';

export class HTMLSanitizer {
  private config: SanitizeConfig;
  
  constructor(config?: Partial<SanitizeConfig>) {
    this.config = { allowedTags: ['p', 'b', 'i', 'u', 'a', 'br', 'ul', 'ol', 'li'], allowedAttributes: { a: ['href'] }, stripScripts: true, ...config };
  }
  
  sanitize(html: string): string {
    let result = html;
    if (this.config.stripScripts) result = result.replace(/<script[^>]*>.*?<\/script>/gi, '');
    result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    result = result.replace(/javascript:/gi, '');
    return result;
  }
  
  stripAllTags(html: string): string { return html.replace(/<[^>]+>/g, ''); }
}

export const DefaultSanitizeConfig: SanitizeConfig = { allowedTags: ['p', 'b', 'i', 'u', 'br'], allowedAttributes: {}, stripScripts: true };