import { ConfigSource } from './types';

export abstract class BaseConfigSource {
  abstract load(): Promise<Map<string, unknown>>;
  abstract watch(callback: (key: string, value: unknown) => void): void;
}

export class EnvConfigSource extends BaseConfigSource {
  constructor(private prefix: string = '') {}
  
  async load(): Promise<Map<string, unknown>> {
    const config = new Map<string, unknown>();
    Object.entries(process.env).forEach(([key, value]) => {
      if (this.prefix && key.startsWith(this.prefix)) {
        config.set(key.slice(this.prefix.length), value);
      } else if (!this.prefix) {
        config.set(key, value);
      }
    });
    return config;
  }
  
  watch(callback: (key: string, value: unknown) => void): void {}
}

export class FileConfigSource extends BaseConfigSource {
  constructor(private filePath: string) {}
  
  async load(): Promise<Map<string, unknown>> {
    return new Map();
  }
  
  watch(callback: (key: string, value: unknown) => void): void {}
}