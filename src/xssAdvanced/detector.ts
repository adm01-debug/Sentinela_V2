import { XSSDetectionResult, DetectedPattern } from './types';

export class XSSDetector {
  private patterns: { name: string; regex: RegExp; severity: XSSDetectionResult['riskLevel'] }[] = [
    { name: 'script_tag', regex: /<script[^>]*>/gi, severity: 'critical' },
    { name: 'event_handler', regex: /on\w+\s*=/gi, severity: 'high' },
    { name: 'javascript_uri', regex: /javascript:/gi, severity: 'high' },
    { name: 'data_uri', regex: /data:[^,]*;base64/gi, severity: 'medium' },
    { name: 'expression', regex: /expression\s*\(/gi, severity: 'high' },
    { name: 'vbscript', regex: /vbscript:/gi, severity: 'high' },
    { name: 'svg_onload', regex: /<svg[^>]*onload/gi, severity: 'critical' },
    { name: 'iframe', regex: /<iframe[^>]*>/gi, severity: 'medium' }
  ];
  
  detect(input: string): XSSDetectionResult {
    const detected: DetectedPattern[] = [];
    let maxSeverity: XSSDetectionResult['riskLevel'] = 'low';
    
    for (const pattern of this.patterns) {
      let match;
      while ((match = pattern.regex.exec(input)) !== null) {
        detected.push({ type: pattern.name, location: match.index, matched: match[0] });
        if (this.compareSeverity(pattern.severity, maxSeverity) > 0) maxSeverity = pattern.severity;
      }
    }
    
    return { detected: detected.length > 0, patterns: detected, riskLevel: maxSeverity };
  }
  
  private compareSeverity(a: XSSDetectionResult['riskLevel'], b: XSSDetectionResult['riskLevel']): number {
    const order = { low: 0, medium: 1, high: 2, critical: 3 };
    return order[a] - order[b];
  }
  
  addPattern(name: string, regex: RegExp, severity: XSSDetectionResult['riskLevel']): void {
    this.patterns.push({ name, regex, severity });
  }
}