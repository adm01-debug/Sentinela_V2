export interface BuildOutput { id: string; buildId: string; files: { path: string; size: number }[]; totalSize: number; createdAt: Date; }
export class BuildOutputManager {
  private outputs = new Map<string, BuildOutput>();
  create(buildId: string, files: { path: string; size: number }[]): BuildOutput { const output: BuildOutput = { id: crypto.randomUUID(), buildId, files, totalSize: files.reduce((sum, f) => sum + f.size, 0), createdAt: new Date() }; this.outputs.set(output.id, output); return output; }
  get(id: string): BuildOutput | undefined { return this.outputs.get(id); }
  getByBuild(buildId: string): BuildOutput | undefined { return Array.from(this.outputs.values()).find(o => o.buildId === buildId); }
  list(): BuildOutput[] { return Array.from(this.outputs.values()); }
}
export const buildOutputManager = new BuildOutputManager();
