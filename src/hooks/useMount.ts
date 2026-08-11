import { useEffect } from "react";

export function useMount(callback: () => void | (() => void)) {
  useEffect(() => {
    return callback();
  }, []);
}
