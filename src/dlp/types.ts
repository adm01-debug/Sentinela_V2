export interface DLPFinding { type: string; value: string; location: { start: number; end: number }; confidence: number; }
export interface ScanResult { findings: DLPFinding[]; scannedAt: Date; inputLength: number; }
