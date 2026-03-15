import log from 'electron-log';
import { CONFIG } from '../config';

export interface AuthResult {
  valid: boolean;
  employee?: {
    id: string;
    name: string;
  };
  config?: {
    screenshotInterval: number;
    keystrokeLogging: boolean;
  };
  error?: string;
}

export class AuthService {
  private agentKey: string;

  constructor(agentKey: string) {
    this.agentKey = agentKey;
  }

  async validate(): Promise<AuthResult> {
    try {
      const response = await fetch(`${CONFIG.API_URL}/validate-agent-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentKey: this.agentKey,
          deviceInfo: {
            platform: process.platform,
            arch: process.arch,
            hostname: require('os').hostname(),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { valid: false, error: error.error || 'Authentication failed' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      log.error('Auth validation error:', error);
      return { valid: false, error: 'Connection failed. Check your internet.' };
    }
  }
}
