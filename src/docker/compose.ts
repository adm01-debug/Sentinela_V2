import { DockerConfig } from './dockerConfig';
export interface ComposeService { build?: string; image?: string; ports?: string[]; volumes?: string[]; environment?: Record<string, string>; depends_on?: string[]; }
export class DockerComposeGenerator {
  generate(services: Record<string, ComposeService>): string { const compose = { version: '3.8', services }; return this.toYaml(compose); }
  private toYaml(obj: any, indent = 0): string { let yaml = ''; const spaces = '  '.repeat(indent); for (const [key, value] of Object.entries(obj)) { if (typeof value === 'object' && !Array.isArray(value)) { yaml += spaces + key + ':\n' + this.toYaml(value, indent + 1); } else if (Array.isArray(value)) { yaml += spaces + key + ':\n'; value.forEach(v => yaml += spaces + '  - ' + v + '\n'); } else { yaml += spaces + key + ': ' + value + '\n'; } } return yaml; }
}
export const dockerComposeGenerator = new DockerComposeGenerator();
