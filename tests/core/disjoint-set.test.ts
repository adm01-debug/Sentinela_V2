import { DisjointSet } from '../../core/disjoint-set';
describe('DisjointSet', () => {
  it('should union and find', () => {
    const ds = new DisjointSet<number>();
    ds.makeSet(1); ds.makeSet(2); ds.makeSet(3);
    ds.union(1, 2);
    expect(ds.connected(1, 2)).toBe(true);
    expect(ds.connected(1, 3)).toBe(false);
  });
});
