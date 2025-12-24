export interface Image { name: string; tag: string; digest: string; size: number; layers: Layer[]; createdAt: Date; }
export interface Layer { digest: string; size: number; mediaType: string; }
export interface Repository { name: string; images: Image[]; visibility: 'public' | 'private'; }
export interface ScanResult { image: string; vulnerabilities: Vulnerability[]; scanDate: Date; }
export interface Vulnerability { id: string; severity: 'low' | 'medium' | 'high' | 'critical'; package: string; fixedIn?: string; }