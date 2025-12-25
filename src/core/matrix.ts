/**
 * @fileoverview Matrix utilities
 * @module @sentinela/core/matrix
 */
export type Matrix<T> = T[][];
export function create<T>(rows: number, cols: number, fill: T): Matrix<T> { return Array.from({ length: rows }, () => Array(cols).fill(fill)); }
export function transpose<T>(m: Matrix<T>): Matrix<T> { return m[0].map((_, i) => m.map(row => row[i])); }
export function multiply(a: Matrix<number>, b: Matrix<number>): Matrix<number> {
  const rows = a.length, cols = b[0].length, n = b.length;
  const result = create(rows, cols, 0);
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) for (let k = 0; k < n; k++) result[i][j] += a[i][k] * b[k][j];
  return result;
}
export function identity(n: number): Matrix<number> { return create(n, n, 0).map((row, i) => { row[i] = 1; return row; }); }
