import { useEffect, useRef } from "react";
export function useWhyDidYouUpdate(name: string, props: Record<string, any>) {
  const prev = useRef<Record<string, any>>({});
  useEffect(() => {
    const changes: Record<string, { from: any; to: any }> = {};
    Object.keys({ ...prev.current, ...props }).forEach(key => {
      if (prev.current[key] !== props[key]) changes[key] = { from: prev.current[key], to: props[key] };
    });
    if (Object.keys(changes).length) console.log(`[${name}] changed:`, changes);
    prev.current = props;
  });
}
