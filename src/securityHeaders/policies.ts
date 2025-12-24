export class CSPBuilder {
  private directives: Map<string, string[]> = new Map();
  
  defaultSrc(...sources: string[]): this { this.directives.set('default-src', sources); return this; }
  scriptSrc(...sources: string[]): this { this.directives.set('script-src', sources); return this; }
  styleSrc(...sources: string[]): this { this.directives.set('style-src', sources); return this; }
  imgSrc(...sources: string[]): this { this.directives.set('img-src', sources); return this; }
  connectSrc(...sources: string[]): this { this.directives.set('connect-src', sources); return this; }
  fontSrc(...sources: string[]): this { this.directives.set('font-src', sources); return this; }
  objectSrc(...sources: string[]): this { this.directives.set('object-src', sources); return this; }
  frameSrc(...sources: string[]): this { this.directives.set('frame-src', sources); return this; }
  reportUri(uri: string): this { this.directives.set('report-uri', [uri]); return this; }
  
  build(): string { return Array.from(this.directives.entries()).map(([k, v]) => k + ' ' + v.join(' ')).join('; '); }
}

export const CSPSources = { SELF: "'self'", NONE: "'none'", UNSAFE_INLINE: "'unsafe-inline'", UNSAFE_EVAL: "'unsafe-eval'", DATA: 'data:', BLOB: 'blob:' };