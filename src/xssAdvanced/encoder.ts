export class HTMLEncoder {
  private entityMap: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  
  encode(input: string): string { return input.replace(/[&<>"'/]/g, char => this.entityMap[char] ?? char); }
  decode(input: string): string { return input.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/'); }
}

export class URLEncoder {
  encode(input: string): string { return encodeURIComponent(input); }
  decode(input: string): string { return decodeURIComponent(input); }
}

export class JavaScriptEncoder {
  encode(input: string): string { return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r'); }
}

export class ContextEncoder {
  html = new HTMLEncoder();
  url = new URLEncoder();
  js = new JavaScriptEncoder();
  
  forContext(context: 'html' | 'url' | 'js', input: string): string {
    switch (context) {
      case 'html': return this.html.encode(input);
      case 'url': return this.url.encode(input);
      case 'js': return this.js.encode(input);
    }
  }
}