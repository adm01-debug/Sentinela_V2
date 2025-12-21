export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  os: string;
  device: 'desktop' | 'mobile' | 'tablet';
  language: string;
  cookiesEnabled: boolean;
}