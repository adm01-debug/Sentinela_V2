/**
 * @fileoverview Graph utilities
 * @module @sentinela/core/graph
 */
export class Graph<T> {
  private adjacency = new Map<T, Set<T>>();
  addVertex(v: T): void { if (!this.adjacency.has(v)) this.adjacency.set(v, new Set()); }
  addEdge(from: T, to: T): void { this.addVertex(from); this.addVertex(to); this.adjacency.get(from)!.add(to); }
  neighbors(v: T): T[] { return Array.from(this.adjacency.get(v) ?? []); }
  hasEdge(from: T, to: T): boolean { return this.adjacency.get(from)?.has(to) ?? false; }
  bfs(start: T): T[] { const visited = new Set<T>(); const queue = [start]; const result: T[] = []; while (queue.length) { const v = queue.shift()!; if (visited.has(v)) continue; visited.add(v); result.push(v); for (const n of this.neighbors(v)) if (!visited.has(n)) queue.push(n); } return result; }
  dfs(start: T): T[] { const visited = new Set<T>(); const result: T[] = []; const visit = (v: T) => { if (visited.has(v)) return; visited.add(v); result.push(v); for (const n of this.neighbors(v)) visit(n); }; visit(start); return result; }
}
