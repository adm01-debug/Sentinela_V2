import { BoundedContext, ContextRelationship, RelationshipType } from './types';

export class ContextMap {
  private contexts: Map<string, BoundedContext> = new Map();
  private relationships: ContextRelationship[] = [];
  
  addContext(context: BoundedContext): this { this.contexts.set(context.name, context); return this; }
  
  addRelationship(upstream: string, downstream: string, type: RelationshipType): this {
    this.relationships.push({ upstream, downstream, type });
    return this;
  }
  
  getContext(name: string): BoundedContext | undefined { return this.contexts.get(name); }
  getAllContexts(): BoundedContext[] { return Array.from(this.contexts.values()); }
  
  getUpstreamContexts(contextName: string): BoundedContext[] {
    return this.relationships
      .filter(r => r.downstream === contextName)
      .map(r => this.contexts.get(r.upstream)!)
      .filter(Boolean);
  }
  
  getDownstreamContexts(contextName: string): BoundedContext[] {
    return this.relationships
      .filter(r => r.upstream === contextName)
      .map(r => this.contexts.get(r.downstream)!)
      .filter(Boolean);
  }
  
  toMermaid(): string {
    let diagram = 'graph TD\n';
    this.contexts.forEach(c => { diagram += '  ' + c.name + '[' + c.name + ']\n'; });
    this.relationships.forEach(r => { diagram += '  ' + r.upstream + ' -->|' + r.type + '| ' + r.downstream + '\n'; });
    return diagram;
  }
}