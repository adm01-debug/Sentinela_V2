// Saga Builder - Fluent API
import { SagaStep, SagaDefinition, SagaOrchestrator } from "./sagaOrchestrator";

export class SagaBuilder<TContext extends Record<string, unknown> = Record<string, unknown>> {
  private name: string = "";
  private steps: SagaStep<TContext>[] = [];

  withName(name: string): this {
    this.name = name;
    return this;
  }

  addStep(
    name: string,
    execute: (context: TContext) => Promise<void>,
    compensate: (context: TContext) => Promise<void>
  ): this {
    this.steps.push({ name, execute, compensate });
    return this;
  }

  addAsyncStep(
    name: string,
    execute: (context: TContext) => Promise<void>,
    compensate: (context: TContext) => Promise<void>,
    timeout: number = 30000
  ): this {
    const wrappedExecute = async (ctx: TContext) => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Step ${name} timed out`)), timeout)
      );
      await Promise.race([execute(ctx), timeoutPromise]);
    };
    this.steps.push({ name, execute: wrappedExecute, compensate });
    return this;
  }

  addConditionalStep(
    name: string,
    condition: (context: TContext) => boolean,
    execute: (context: TContext) => Promise<void>,
    compensate: (context: TContext) => Promise<void>
  ): this {
    const wrappedExecute = async (ctx: TContext) => {
      if (condition(ctx)) await execute(ctx);
    };
    const wrappedCompensate = async (ctx: TContext) => {
      if (condition(ctx)) await compensate(ctx);
    };
    this.steps.push({ name, execute: wrappedExecute, compensate: wrappedCompensate });
    return this;
  }

  build(): SagaDefinition<TContext> {
    if (!this.name) throw new Error("Saga name is required");
    if (this.steps.length === 0) throw new Error("At least one step is required");
    return { name: this.name, steps: this.steps };
  }

  buildOrchestrator(): SagaOrchestrator<TContext> {
    return new SagaOrchestrator(this.build());
  }
}

export const createSaga = <TContext extends Record<string, unknown>>(): SagaBuilder<TContext> => {
  return new SagaBuilder<TContext>();
};
