/**
 * @fileoverview CRD controller
 * @module @sentinela/core/customResources
 * @version 13.0.0
 */

import { CustomResource, CustomResourceDefinition } from './types';

export class CustomResourceController {
  private resources: Map<string, CustomResource[]> = new Map();
  private handlers: Map<string, ResourceHandler> = new Map();
  
  registerHandler(kind: string, handler: ResourceHandler): void { this.handlers.set(kind, handler); }
  
  async create(resource: CustomResource): Promise<CustomResource> {
    const key = resource.kind;
    const list = this.resources.get(key) ?? [];
    list.push(resource);
    this.resources.set(key, list);
    
    const handler = this.handlers.get(resource.kind);
    if (handler?.onCreate) await handler.onCreate(resource);
    
    return resource;
  }
  
  async update(resource: CustomResource): Promise<CustomResource> {
    const handler = this.handlers.get(resource.kind);
    if (handler?.onUpdate) await handler.onUpdate(resource);
    return resource;
  }
  
  async delete(kind: string, name: string, namespace?: string): Promise<void> {
    const list = this.resources.get(kind) ?? [];
    const index = list.findIndex(r => r.metadata.name === name && r.metadata.namespace === namespace);
    if (index >= 0) {
      const resource = list[index];
      const handler = this.handlers.get(kind);
      if (handler?.onDelete) await handler.onDelete(resource);
      list.splice(index, 1);
    }
  }
  
  list(kind: string, namespace?: string): CustomResource[] {
    const all = this.resources.get(kind) ?? [];
    return namespace ? all.filter(r => r.metadata.namespace === namespace) : all;
  }
}

export interface ResourceHandler { onCreate?: (resource: CustomResource) => Promise<void>; onUpdate?: (resource: CustomResource) => Promise<void>; onDelete?: (resource: CustomResource) => Promise<void>; }