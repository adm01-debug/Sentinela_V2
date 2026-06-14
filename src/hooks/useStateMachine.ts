import { useState, useCallback } from "react";

type Transitions<S extends string, E extends string> = Record<S, Partial<Record<E, S>>>;

export function useStateMachine<S extends string, E extends string>(
  initialState: S,
  transitions: Transitions<S, E>
) {
  const [state, setState] = useState(initialState);

  const send = useCallback((event: E) => {
    const nextState = transitions[state]?.[event];
    if (nextState) setState(nextState);
  }, [state, transitions]);

  const can = useCallback((event: E) => !!transitions[state]?.[event], [state, transitions]);

  return { state, send, can };
}
