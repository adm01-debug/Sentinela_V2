import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton as UISkeleton } from "@/components/ui/skeleton";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  height?: number;
  width?: number;
  style?: React.CSSProperties;
};

/**
 * Backward-compatible Skeleton used across legacy components.
 * Supports numeric height/width props (in px) plus className.
 */
export function Skeleton({ height, width, style, className, ...props }: Props) {
  return (
    <UISkeleton
      className={cn(className)}
      style={{
        ...style,
        ...(height !== undefined ? { height: `${height}px` } : null),
        ...(width !== undefined ? { width: `${width}px` } : null),
      }}
      {...props}
    />
  );
}
