export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  type: string;
  from: string;
  to: string;
  properties: Record<string, unknown>;
}

export class GraphStore {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private outEdges: Map<string, string[]> = new Map();
  private inEdges: Map<string, string[]> = new Map();
  
  createNode(id: string, labels: string[], properties: Record<string, unknown> = {}): GraphNode {
    const node: GraphNode = { id, labels, properties };
    this.nodes.set(id, node);
    return node;
  }
  
  createEdge(id: string, type: string, from: string, to: string, properties: Record<string, unknown> = {}): GraphEdge {
    const edge: GraphEdge = { id, type, from, to, properties };
    this.edges.set(id, edge);
    const out = this.outEdges.get(from) ?? []; out.push(id); this.outEdges.set(from, out);
    const inE = this.inEdges.get(to) ?? []; inE.push(id); this.inEdges.set(to, inE);
    return edge;
  }
  
  getNode(id: string): GraphNode | undefined { return this.nodes.get(id); }
  getEdge(id: string): GraphEdge | undefined { return this.edges.get(id); }
  
  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return (this.outEdges.get(nodeId) ?? []).map(id => this.edges.get(id)!).filter(Boolean);
  }
  
  getIncomingEdges(nodeId: string): GraphEdge[] {
    return (this.inEdges.get(nodeId) ?? []).map(id => this.edges.get(id)!).filter(Boolean);
  }
  
  findNodesByLabel(label: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.labels.includes(label));
  }
  
  traverse(startId: string, depth: number = 3): TraversalResult {
    const visited = new Set<string>();
    const result: TraversalResult = { nodes: [], edges: [] };
    this.traverseRecursive(startId, depth, visited, result);
    return result;
  }
  
  private traverseRecursive(nodeId: string, depth: number, visited: Set<string>, result: TraversalResult): void {
    if (depth < 0 || visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (node) result.nodes.push(node);
    for (const edge of this.getOutgoingEdges(nodeId)) {
      result.edges.push(edge);
      this.traverseRecursive(edge.to, depth - 1, visited, result);
    }
  }
}

export interface TraversalResult { nodes: GraphNode[]; edges: GraphEdge[]; }