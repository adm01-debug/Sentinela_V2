import { XSSDetection, XSSType } from './types';

export class XSSDetector {
  private patterns: { type: XSSType; regex: RegExp }[] = [
    { type: 'reflected', regex: /<script[^>]*>/i },
    { type: 'dom', regex: /document\.(write|cookie|location)/i },
    { type: 'stored', regex: /on\w+\s*=/i },
    { type: 'mutation', regex: /innerHTML|outerHTML/i }
  ];
  
  detect(input: string): XSSDetection {
    for (const pattern of this.patterns) {
      const match = input.match(pattern.regex);
      if (match) return { detected: true, type: pattern.type, payload: match[0] };
    }
    return { detected: false };
  }
  
  detectAll(input: string): XSSDetection[] {
    return this.patterns.map(p => {
      const match = input.match(p.regex);
      return match ? { detected: true, type: p.type, payload: match[0] } : { detected: false };
    }).filter(d => d.detected);
  }
  
  addPattern(type: XSSType, regex: RegExp): void { this.patterns.push({ type, regex }); }
}