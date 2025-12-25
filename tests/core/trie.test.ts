import { Trie } from '../../core/trie';
describe('Trie', () => {
  it('should insert and search', () => { const t = new Trie(); t.insert('hello'); t.insert('help'); expect(t.search('hello')).toBe(true); expect(t.search('hel')).toBe(false); });
  it('should check prefix', () => { const t = new Trie(); t.insert('hello'); expect(t.startsWith('hel')).toBe(true); expect(t.startsWith('abc')).toBe(false); });
});
