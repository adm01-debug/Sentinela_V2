export type TransformFn = (record: any) => any;
export interface TransformStep { name: string; fn: TransformFn; }
export class Transformer {
  private steps: TransformStep[] = [];
  addStep(name: string, fn: TransformFn): void { this.steps.push({ name, fn }); }
  transform(data: any[]): any[] { return data.map(record => { let transformed = record; for (const step of this.steps) { transformed = step.fn(transformed); } return transformed; }); }
  removeStep(name: string): void { this.steps = this.steps.filter(s => s.name !== name); }
  getSteps(): string[] { return this.steps.map(s => s.name); }
  clear(): void { this.steps = []; }
}
export const transformer = new Transformer();
