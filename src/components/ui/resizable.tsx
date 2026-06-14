import { GripVertical } from "lucide-react";
import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelGroupProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

interface HandleProps extends HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
  className?: string;
}

const ResizablePanelGroup = ({ className, ...props }: PanelGroupProps) => (
  <div className={cn("flex h-full w-full", className)} {...props} />
);

const ResizablePanel = (props: PanelProps) => <div {...props} />;

const ResizableHandle = ({ withHandle, className, ...props }: HandleProps) => (
  <div className={cn("relative flex w-px items-center justify-center bg-border", className)} {...props}>
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </div>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
