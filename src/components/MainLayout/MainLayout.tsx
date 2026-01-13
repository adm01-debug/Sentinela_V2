import React from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MainLayout({ children, sidebar, header, footer }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && (
        <header className="sticky top-0 z-50 border-b bg-background">
          {header}
        </header>
      )}
      <div className="flex flex-1">
        {sidebar && (
          <aside className="hidden md:block w-64 border-r bg-background">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}
    </div>
  );
}
