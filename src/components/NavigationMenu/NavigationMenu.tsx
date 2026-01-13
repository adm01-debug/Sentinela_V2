import React from "react";
import { cn } from "@/lib/utils";

interface NavigationMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationMenuItemProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function NavigationMenu({ children, className }: NavigationMenuProps) {
  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {children}
    </nav>
  );
}

export function NavigationMenuItem({ href, children, active, icon, onClick }: NavigationMenuItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={(e) => { if (onClick) { e.preventDefault(); onClick(); } }}
    >
      {icon}
      {children}
    </a>
  );
}
