/**
 * @fileoverview DLP Scanner implementation
 * @module @sentinela/core/dlp
 * @version 13.0.0
 */

export interface DLPFinding {
  type: 'SSN' | 'CREDIT_CARD' | 'EMAIL' | 'PHONE' | 'API_KEY' | 'PASSWORD';
  value: string;
  location: { start: number; end: number };
  confidence: number;
}

export interface ScanResult {
  findings: DLPFinding[];
  scannedAt: Date;
  inputLength: number;
}

const PATTERNS: Array<{ type: DLPFinding['type']; regex: RegExp }> = [
  { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'CREDIT_CARD', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g },
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
  { type: 'PHONE', regex: /\b(?:\+1[-.]?)?\(?[0-9]{3}\)?[-.]?[0-9]{3}[-.]?[0-9]{4}\b/g },
];

export class DLPScanner {
  async scan(text: string): Promise<ScanResult> {
    const findings: DLPFinding[] = [];
    
    for (const { type, regex } of PATTERNS) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        findings.push({
          type,
          value: match[0],
          location: { start: match.index, end: match.index + match[0].length },
          confidence: 0.9
        });
      }
    }

    return { findings, scannedAt: new Date(), inputLength: text.length };
  }

  async redact(text: string): Promise<string> {
    let result = text;
    const { findings } = await this.scan(text);
    
    for (const finding of findings.sort((a, b) => b.location.start - a.location.start)) {
      const replacement = '[REDACTED]';
      result = result.slice(0, finding.location.start) + replacement + result.slice(finding.location.end);
    }
    
    return result;
  }
}
