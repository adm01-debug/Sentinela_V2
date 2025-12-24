export interface DiffResult { added: string[]; removed: string[]; changed: { path: string; oldValue: any; newValue: any }[]; }
export class SnapshotDiff {
  compare(oldSnapshot: any, newSnapshot: any, path = ''): DiffResult { const result: DiffResult = { added: [], removed: [], changed: [] }; const oldKeys = Object.keys(oldSnapshot || {}); const newKeys = Object.keys(newSnapshot || {}); newKeys.filter(k => !oldKeys.includes(k)).forEach(k => result.added.push(path ? path + '.' + k : k)); oldKeys.filter(k => !newKeys.includes(k)).forEach(k => result.removed.push(path ? path + '.' + k : k)); oldKeys.filter(k => newKeys.includes(k)).forEach(k => { if (JSON.stringify(oldSnapshot[k]) !== JSON.stringify(newSnapshot[k])) { result.changed.push({ path: path ? path + '.' + k : k, oldValue: oldSnapshot[k], newValue: newSnapshot[k] }); } }); return result; }
}
export const snapshotDiff = new SnapshotDiff();
