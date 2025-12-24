import { ScanResult, DLPAction } from './types';

export class DLPActionExecutor {
  private handlers: Map<DLPAction, (result: ScanResult) => void> = new Map();
  
  registerHandler(action: DLPAction, handler: (result: ScanResult) => void): void {
    this.handlers.set(action, handler);
  }
  
  execute(result: ScanResult): void {
    result.actions.forEach(action => {
      const handler = this.handlers.get(action);
      if (handler) handler(result);
    });
  }
}

export class DataMasker {
  mask(content: string, violations: ScanResult['violations']): string {
    let masked = content;
    violations.sort((a, b) => b.location.start - a.location.start).forEach(v => {
      const replacement = '*'.repeat(v.matched.length);
      masked = masked.substring(0, v.location.start) + replacement + masked.substring(v.location.end);
    });
    return masked;
  }
  
  partialMask(content: string, violations: ScanResult['violations'], visibleChars: number = 4): string {
    let masked = content;
    violations.sort((a, b) => b.location.start - a.location.start).forEach(v => {
      const visible = v.matched.slice(-visibleChars);
      const replacement = '*'.repeat(Math.max(0, v.matched.length - visibleChars)) + visible;
      masked = masked.substring(0, v.location.start) + replacement + masked.substring(v.location.end);
    });
    return masked;
  }
}