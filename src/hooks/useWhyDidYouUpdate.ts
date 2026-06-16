import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";

export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>) {
  const prev = useRef<Record<string, unknown>>({});
  useEffect(() => {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    Object.keys({ ...prev.current, ...props }).forEach((key) => {
      if (prev.current[key] !== props[key])
        changes[key] = { from: prev.current[key], to: props[key] };
    });
    if (Object.keys(changes).length) logger.info(`[${name}] changed:`, changes);
    prev.current = props;
  });
}
