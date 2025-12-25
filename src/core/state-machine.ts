/**
 * @fileoverview Finite State Machine implementation
 * @module @sentinela/core
 * @version 13.0.0
 */

export interface StateConfig<S extends string, E extends string> {
  initial: S;
  states: Record<S, {
    on?: Partial<Record<E, S>>;
    onEnter?: () => void;
    onExit?: () => void;
  }>;
}

export class StateMachine<S extends string, E extends string> {
  private currentState: S;
  private listeners: Array<(from: S, to: S, event: E) => void> = [];

  constructor(private config: StateConfig<S, E>) {
    this.currentState = config.initial;
    this.config.states[this.currentState].onEnter?.();
  }

  get state(): S { return this.currentState; }

  can(event: E): boolean {
    const transitions = this.config.states[this.currentState].on;
    return !!transitions && event in transitions;
  }

  send(event: E): S {
    const stateConfig = this.config.states[this.currentState];
    const nextState = stateConfig.on?.[event];
    
    if (!nextState) {
      throw new Error(\`Invalid transition: \${this.currentState} + \${event}\`);
    }

    stateConfig.onExit?.();
    const prevState = this.currentState;
    this.currentState = nextState;
    this.config.states[nextState].onEnter?.();
    
    this.listeners.forEach(fn => fn(prevState, nextState, event));
    return nextState;
  }

  onTransition(fn: (from: S, to: S, event: E) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }
}

export function createMachine<S extends string, E extends string>(
  config: StateConfig<S, E>
): StateMachine<S, E> {
  return new StateMachine(config);
}
