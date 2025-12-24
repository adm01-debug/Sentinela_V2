export class OutputEncoder {
  static htmlEncode(input: string): string {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
    return input.replace(/[&<>"'\/]/g, char => entities[char]);
  }
  
  static urlEncode(input: string): string { return encodeURIComponent(input); }
  
  static jsEncode(input: string): string {
    return input.replace(/[\\'"\n\r\t]/g, char => {
      const escapes: Record<string, string> = { '\\': '\\\\', "'": "\\'", '"': '\\"', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
      return escapes[char] ?? char;
    });
  }
  
  static cssEncode(input: string): string {
    return input.replace(/[^a-zA-Z0-9]/g, char => '\\' + char.charCodeAt(0).toString(16) + ' ');
  }
  
  static encodeForContext(input: string, context: 'html' | 'url' | 'js' | 'css'): string {
    switch (context) {
      case 'html': return this.htmlEncode(input);
      case 'url': return this.urlEncode(input);
      case 'js': return this.jsEncode(input);
      case 'css': return this.cssEncode(input);
    }
  }
}