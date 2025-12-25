import { createNode, traverse, find, map, flatten } from '../../core/tree';
describe('Tree', () => {
  const tree = createNode(1, [createNode(2), createNode(3, [createNode(4)])]);
  it('should traverse', () => { const values: number[] = []; traverse(tree, n => values.push(n.value)); expect(values).toEqual([1, 2, 3, 4]); });
  it('should find', () => { expect(find(tree, v => v === 4)?.value).toBe(4); expect(find(tree, v => v === 5)).toBeUndefined(); });
  it('should map', () => { const mapped = map(tree, v => v * 2); expect(mapped.value).toBe(2); });
  it('should flatten', () => { expect(flatten(tree)).toEqual([1, 2, 3, 4]); });
});
