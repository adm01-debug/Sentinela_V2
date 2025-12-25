/**
 * @fileoverview Trie data structure
 * @module @sentinela/core/trie
 */
class TrieNode { children = new Map<string, TrieNode>(); isEnd = false; }
export class Trie {
  private root = new TrieNode();
  insert(word: string): void { let node = this.root; for (const c of word) { if (!node.children.has(c)) node.children.set(c, new TrieNode()); node = node.children.get(c)!; } node.isEnd = true; }
  search(word: string): boolean { const node = this.findNode(word); return node?.isEnd ?? false; }
  startsWith(prefix: string): boolean { return this.findNode(prefix) !== undefined; }
  private findNode(s: string): TrieNode | undefined { let node = this.root; for (const c of s) { if (!node.children.has(c)) return undefined; node = node.children.get(c)!; } return node; }
}
