export class EnvLoader {
  private env: Record<string, string> = {};
  load(): void { if (typeof process !== 'undefined' && process.env) { Object.entries(process.env).forEach(([k, v]) => { if (v) this.env[k] = v; }); } if (typeof import.meta !== 'undefined') { Object.entries(import.meta.env || {}).forEach(([k, v]) => { if (typeof v === 'string') this.env[k] = v; }); } }
  get(key: string, defaultValue?: string): string { return this.env[key] || defaultValue || ''; }
  getRequired(key: string): string { const value = this.env[key]; if (!value) throw new Error('Env var not found: ' + key); return value; }
  getAll(): Record<string, string> { return { ...this.env }; }
}
export const envLoader = new EnvLoader();
