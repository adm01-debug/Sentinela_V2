export interface BoundedContext {
  name: string;
  description: string;
  aggregates: string[];
  services: string[];
  events: string[];
}

export interface ContextRelationship {
  upstream: string;
  downstream: string;
  type: RelationshipType;
}

export enum RelationshipType {
  SharedKernel = 'shared_kernel',
  CustomerSupplier = 'customer_supplier',
  Conformist = 'conformist',
  AntiCorruptionLayer = 'acl',
  OpenHostService = 'open_host',
  PublishedLanguage = 'published_language'
}