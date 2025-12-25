import { Graph } from '../../core/graph';
describe('Graph', () => {
  it('should add vertices and edges', () => {
    const g = new Graph<string>();
    g.addEdge('a', 'b');
    g.addEdge('b', 'c');
    expect(g.hasEdge('a', 'b')).toBe(true);
    expect(g.hasEdge('b', 'c')).toBe(true);
    expect(g.hasEdge('a', 'c')).toBe(false);
  });
  it('should bfs', () => { const g = new Graph<number>(); g.addEdge(1, 2); g.addEdge(1, 3); g.addEdge(2, 4); expect(g.bfs(1)).toEqual([1, 2, 3, 4]); });
  it('should dfs', () => { const g = new Graph<number>(); g.addEdge(1, 2); g.addEdge(2, 3); expect(g.dfs(1)).toEqual([1, 2, 3]); });
});
