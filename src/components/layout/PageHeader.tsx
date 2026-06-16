import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  showBackButton?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
  showBackButton = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-2 duration-500 animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      {/* Centralized Breadcrumbs */}
      <Breadcrumbs className="mb-2" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          {showBackButton && <BackButton className="-ml-2 mb-1 self-start" />}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {(actions || children) && (
          <div className="flex shrink-0 items-center gap-2">{actions || children}</div>
        )}
      </div>
    </div>
  );
}
