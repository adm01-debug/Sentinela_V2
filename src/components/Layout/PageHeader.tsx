import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
  children?: ReactNode;
}

export function PageHeader({ title, description, action, children }: Props) {
  return (
    <div className="flex items-center justify-between pb-6 border-b mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {children}
        {action && (
          <Button onClick={action.onClick}>
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
