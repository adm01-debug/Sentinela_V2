export interface DockerConfig { image: string; tag: string; ports: { host: number; container: number }[]; volumes: { host: string; container: string }[]; env: Record<string, string>; network?: string; }
export const defaultDockerConfig: DockerConfig = { image: 'sentinela', tag: 'latest', ports: [{ host: 3000, container: 3000 }], volumes: [], env: { NODE_ENV: 'production' } };
export class DockerConfigManager {
  private config: DockerConfig = { ...defaultDockerConfig };
  get(): DockerConfig { return { ...this.config }; }
  set(config: Partial<DockerConfig>): void { this.config = { ...this.config, ...config }; }
  addPort(host: number, container: number): void { this.config.ports.push({ host, container }); }
  addVolume(host: string, container: string): void { this.config.volumes.push({ host, container }); }
  setEnv(key: string, value: string): void { this.config.env[key] = value; }
}
export const dockerConfigManager = new DockerConfigManager();
