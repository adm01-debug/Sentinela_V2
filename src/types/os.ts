export interface OSInfo {
  name: string;
  version: string;
  platform: 'windows' | 'macos' | 'linux';
  arch: 'x64' | 'arm64';
  hostname: string;
  uptime: number;
}