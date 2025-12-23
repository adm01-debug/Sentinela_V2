export type MergeMode = 'overwrite' | 'merge-deep' | 'merge-shallow' | 'keep-local' | 'keep-remote';
export class MergeStrategy {
  merge<T extends object>(local: T, remote: T, mode: MergeMode = 'merge-deep'): T { switch (mode) { case 'overwrite': return remote; case 'keep-local': return local; case 'keep-remote': return remote; case 'merge-shallow': return { ...remote, ...local }; case 'merge-deep': return this.deepMerge(local, remote); } }
  private deepMerge<T extends object>(local: T, remote: T): T { const result = { ...remote } as T; for (const key in local) { if (typeof local[key] === 'object' && local[key] !== null && !Array.isArray(local[key])) { (result as any)[key] = this.deepMerge(local[key] as any, (remote as any)[key] || {}); } else { (result as any)[key] = local[key]; } } return result; }
}
export const mergeStrategy = new MergeStrategy();
