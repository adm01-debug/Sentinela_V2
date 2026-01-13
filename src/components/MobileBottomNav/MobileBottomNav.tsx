import React from "react";
import { cn } from "@/lib/utils";
import { Home, Users, BarChart3, Settings, Bell } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface MobileBottomNavProps {
  items?: NavItem[];
  onNavigate?: (href: string) => void;
}

const defaultItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
  { icon: <Users className="h-5 w-5" />, label: "Team", href: "/team" },
  { icon: <BarChart3 className="h-5 w-5" />, label: "Reports", href: "/reports" },
  { icon: <Bell className="h-5 w-5" />, label: "Alerts", href: "/alerts" },
  { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/settings" }
];

export function MobileBottomNav({ items = defaultItems, onNavigate }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => (
          <button
            key={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-xs",
              item.active ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => onNavigate?.(item.href)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
