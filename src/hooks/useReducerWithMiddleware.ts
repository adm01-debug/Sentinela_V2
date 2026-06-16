import { useReducer, useRef, useCallback, Reducer, Dispatch } from "react";

type Middleware<S, A> = (state: S, action: A, next: Dispatch<A>) => void;

export function useReducerWithMiddleware<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = []
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatchWithMiddleware = useCallback(
    (action: A) => {
      let index = 0;

      const next: Dispatch<A> = (nextAction: A) => {
        if (index < middlewares.length) {
          const middleware = middlewares[index++];
          middleware(stateRef.current, nextAction, next);
        } else {
          dispatch(nextAction);
        }
      };

      next(action);
    },
    [middlewares]
  );

  return [state, dispatchWithMiddleware] as const;
}
