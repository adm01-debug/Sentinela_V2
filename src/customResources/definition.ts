import { CustomResourceDefinition, CRDSpec, CRDVersion } from './types';

export class CRDBuilder {
  private crd: Partial<CustomResourceDefinition> = { apiVersion: 'apiextensions.k8s.io/v1', kind: 'CustomResourceDefinition' };
  
  name(name: string): this { this.crd.metadata = { name }; return this; }
  
  spec(group: string, kind: string, plural: string): this {
    this.crd.spec = { group, names: { plural, singular: kind.toLowerCase(), kind }, scope: 'Namespaced', versions: [] };
    return this;
  }
  
  version(name: string, schema?: CRDVersion['schema']): this {
    this.crd.spec!.versions.push({ name, served: true, storage: this.crd.spec!.versions.length === 0, schema });
    return this;
  }
  
  clusterScoped(): this { this.crd.spec!.scope = 'Cluster'; return this; }
  shortNames(...names: string[]): this { this.crd.spec!.names.shortNames = names; return this; }
  
  build(): CustomResourceDefinition { return this.crd as CustomResourceDefinition; }
}

export class CRDRegistry {
  private crds: Map<string, CustomResourceDefinition> = new Map();
  
  register(crd: CustomResourceDefinition): void { this.crds.set(crd.metadata.name, crd); }
  get(name: string): CustomResourceDefinition | undefined { return this.crds.get(name); }
  list(): CustomResourceDefinition[] { return Array.from(this.crds.values()); }
  
  getByGroupKind(group: string, kind: string): CustomResourceDefinition | undefined {
    return Array.from(this.crds.values()).find(c => c.spec.group === group && c.spec.names.kind === kind);
  }
}