import { ReactNode } from "react";
import { cn } from "@/helpers";

interface Props {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: Props) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
