/**
 * @fileoverview Tree utilities
 * @module @sentinela/core/tree
 */
export interface TreeNode<T> { value: T; children: TreeNode<T>[]; }
export function createNode<T>(value: T, children: TreeNode<T>[] = []): TreeNode<T> { return { value, children }; }
export function traverse<T>(node: TreeNode<T>, fn: (node: TreeNode<T>) => void): void { fn(node); node.children.forEach(child => traverse(child, fn)); }
export function find<T>(node: TreeNode<T>, predicate: (value: T) => boolean): TreeNode<T> | undefined { if (predicate(node.value)) return node; for (const child of node.children) { const found = find(child, predicate); if (found) return found; } return undefined; }
export function map<T, R>(node: TreeNode<T>, fn: (value: T) => R): TreeNode<R> { return { value: fn(node.value), children: node.children.map(child => map(child, fn)) }; }
export function flatten<T>(node: TreeNode<T>): T[] { const result: T[] = [node.value]; node.children.forEach(child => result.push(...flatten(child))); return result; }
