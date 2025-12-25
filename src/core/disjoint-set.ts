/**
 * @fileoverview Disjoint Set (Union-Find)
 * @module @sentinela/core/disjoint-set
 */
export class DisjointSet<T> {
  private parent = new Map<T, T>();
  private rank = new Map<T, number>();
  makeSet(x: T): void { if (!this.parent.has(x)) { this.parent.set(x, x); this.rank.set(x, 0); } }
  find(x: T): T { if (this.parent.get(x) !== x) this.parent.set(x, this.find(this.parent.get(x)!)); return this.parent.get(x)!; }
  union(x: T, y: T): void { const px = this.find(x), py = this.find(y); if (px === py) return; const rx = this.rank.get(px)!, ry = this.rank.get(py)!; if (rx < ry) this.parent.set(px, py); else if (rx > ry) this.parent.set(py, px); else { this.parent.set(py, px); this.rank.set(px, rx + 1); } }
  connected(x: T, y: T): boolean { return this.find(x) === this.find(y); }
}
