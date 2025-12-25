/**
 * @fileoverview Pipeline pattern implementation
 * @module @sentinela/core
 * @version 13.0.0
 */

export type PipelineStep<T, R = T> = (input: T) => R | Promise<R>;

export class Pipeline<T> {
  private steps: PipelineStep<any, any>[] = [];

  /**
   * Add a step to the pipeline
   */
  pipe<R>(step: PipelineStep<T, R>): Pipeline<R> {
    const newPipeline = new Pipeline<R>();
    newPipeline.steps = [...this.steps, step];
    return newPipeline;
  }

  /**
   * Execute the pipeline
   */
  async execute(input: T): Promise<T> {
    let result: any = input;
    for (const step of this.steps) {
      result = await step(result);
    }
    return result;
  }

  /**
   * Execute synchronously (all steps must be sync)
   */
  executeSync(input: T): T {
    let result: any = input;
    for (const step of this.steps) {
      result = step(result);
    }
    return result;
  }
}

export function pipeline<T>(): Pipeline<T> {
  return new Pipeline<T>();
}

/**
 * Compose functions right-to-left
 */
export function compose<T>(...fns: PipelineStep<T>[]): PipelineStep<T> {
  return (input: T) => fns.reduceRight((acc, fn) => fn(acc as T), input as any);
}

/**
 * Pipe functions left-to-right
 */
export function pipe<T>(...fns: PipelineStep<T>[]): PipelineStep<T> {
  return (input: T) => fns.reduce((acc, fn) => fn(acc as T), input as any);
}
