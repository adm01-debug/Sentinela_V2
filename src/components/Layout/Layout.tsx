import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
}

export function LayoutHeader({ children, className }: LayoutProps) {
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur", className)}>
      {children}
    </header>
  );
}

export function LayoutMain({ children, className }: LayoutProps) {
  return (
    <main className={cn("flex-1", className)}>
      {children}
    </main>
  );
}

export function LayoutSidebar({ children, className }: LayoutProps) {
  return (
    <aside className={cn("w-64 border-r bg-background", className)}>
      {children}
    </aside>
  );
}
