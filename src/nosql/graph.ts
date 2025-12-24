import { GraphNode, GraphEdge } from './types';
import { v4 as uuidv4 } from 'uuid';

export class GraphDatabase {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  
  createNode(labels: string[], properties: Record<string, unknown>): GraphNode {
    const node: GraphNode = { id: uuidv4(), labels, properties };
    this.nodes.set(node.id, node);
    return node;
  }
  
  createEdge(from: string, to: string, type: string, properties: Record<string, unknown> = {}): GraphEdge {
    const edge: GraphEdge = { id: uuidv4(), type, from, to, properties };
    this.edges.set(edge.id, edge);
    return edge;
  }
  
  getNode(id: string): GraphNode | undefined { return this.nodes.get(id); }
  
  findNodes(label: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.labels.includes(label));
  }
  
  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(e => e.from === nodeId);
  }
  
  getIncomingEdges(nodeId: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(e => e.to === nodeId);
  }
  
  traverse(startId: string, depth: number = 1): TraversalResult {
    const visited = new Set<string>();
    const result: TraversalResult = { nodes: [], edges: [], paths: [] };
    this.dfs(startId, depth, visited, result, []);
    return result;
  }
  
  private dfs(nodeId: string, depth: number, visited: Set<string>, result: TraversalResult, path: string[]): void {
    if (depth < 0 || visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (node) { result.nodes.push(node); result.paths.push([...path, nodeId]); }
    for (const edge of this.getOutgoingEdges(nodeId)) {
      result.edges.push(edge);
      this.dfs(edge.to, depth - 1, visited, result, [...path, nodeId]);
    }
  }
}

export interface TraversalResult { nodes: GraphNode[]; edges: GraphEdge[]; paths: string[][]; }