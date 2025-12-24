import { SanitizerConfig } from './types';

export class HTMLSanitizer {
  private config: SanitizerConfig;
  
  constructor(config?: Partial<SanitizerConfig>) {
    this.config = {
      allowedTags: config?.allowedTags ?? ['p', 'b', 'i', 'u', 'a', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: config?.allowedAttributes ?? { a: ['href', 'title'] },
      allowedProtocols: config?.allowedProtocols ?? ['http', 'https', 'mailto'],
      stripComments: config?.stripComments ?? true
    };
  }
  
  sanitize(html: string): string {
    let result = html;
    
    if (this.config.stripComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
    result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    result = result.replace(/javascript:/gi, '');
    
    const tagRegex = /<(\/?)(\w+)([^>]*)>/g;
    result = result.replace(tagRegex, (match, close, tag, attrs) => {
      if (!this.config.allowedTags.includes(tag.toLowerCase())) return '';
      const cleanAttrs = this.sanitizeAttributes(tag.toLowerCase(), attrs);
      return '<' + close + tag + cleanAttrs + '>';
    });
    
    return result;
  }
  
  private sanitizeAttributes(tag: string, attrs: string): string {
    const allowed = this.config.allowedAttributes[tag] ?? [];
    if (allowed.length === 0) return '';
    
    const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
    const cleanAttrs: string[] = [];
    let match;
    
    while ((match = attrRegex.exec(attrs)) !== null) {
      const [, name, value] = match;
      if (allowed.includes(name.toLowerCase()) && this.isValidAttributeValue(name, value)) {
        cleanAttrs.push(name + '="' + this.escapeAttribute(value) + '"');
      }
    }
    
    return cleanAttrs.length ? ' ' + cleanAttrs.join(' ') : '';
  }
  
  private isValidAttributeValue(name: string, value: string): boolean {
    if (name === 'href' || name === 'src') {
      const protocol = value.split(':')[0].toLowerCase();
      return this.config.allowedProtocols.includes(protocol) || value.startsWith('/') || value.startsWith('#');
    }
    return true;
  }
  
  private escapeAttribute(value: string): string {
    return value.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}