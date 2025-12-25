export interface Vulnerability { id: string; type: string; severity: string; title: string; description: string; remediation?: string; }
export interface ScanResult { target: string; scannedAt: Date; vulnerabilities: Vulnerability[]; critical: number; high: number; medium: number; low: number; }
