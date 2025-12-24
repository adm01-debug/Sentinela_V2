import { ConfigMap } from './types';

export class ConfigMapManager {
  private configMaps: Map<string, ConfigMap> = new Map();
  
  create(cm: ConfigMap): void { this.configMaps.set(this.key(cm.namespace, cm.name), cm); }
  update(cm: ConfigMap): void { this.configMaps.set(this.key(cm.namespace, cm.name), cm); }
  delete(namespace: string, name: string): boolean { return this.configMaps.delete(this.key(namespace, name)); }
  get(namespace: string, name: string): ConfigMap | undefined { return this.configMaps.get(this.key(namespace, name)); }
  
  list(namespace?: string): ConfigMap[] {
    const all = Array.from(this.configMaps.values());
    return namespace ? all.filter(cm => cm.namespace === namespace) : all;
  }
  
  getValue(namespace: string, name: string, key: string): string | undefined {
    return this.get(namespace, name)?.data[key];
  }
  
  private key(namespace: string, name: string): string { return namespace + '/' + name; }
}