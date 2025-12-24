export interface K8sConfig { apiVersion: string; kind: string; metadata: { name: string; namespace?: string; labels?: Record<string, string> }; spec: any; }
export class K8sConfigBuilder {
  private config: Partial<K8sConfig> = {};
  setApiVersion(version: string): this { this.config.apiVersion = version; return this; }
  setKind(kind: string): this { this.config.kind = kind; return this; }
  setMetadata(name: string, namespace?: string, labels?: Record<string, string>): this { this.config.metadata = { name, namespace, labels }; return this; }
  setSpec(spec: any): this { this.config.spec = spec; return this; }
  build(): K8sConfig { return this.config as K8sConfig; }
  toYaml(): string { return JSON.stringify(this.config, null, 2); }
}
export const createK8sConfig = () => new K8sConfigBuilder();
