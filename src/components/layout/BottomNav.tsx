import { memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Shield, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.employees", href: "/employees", icon: Users },
  { labelKey: "sections.security", href: "/violations", icon: Shield },
  { labelKey: "nav.reports", href: "/reports", icon: FileText },
  { labelKey: "nav.settings", href: "/settings", icon: Settings },
];

function BottomNavComponent() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "relative flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-2 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground active:scale-95"
              )}
            >
              {/* Active background pill */}
              {isActive && (
                <div className="absolute inset-x-2 inset-y-1 -z-10 rounded-xl bg-primary/10" />
              )}
              <Icon
                className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {t(item.labelKey)}
              </span>
              {/* Active dot indicator */}
              {isActive && (
                <div className="absolute -bottom-0.5 h-[3px] w-5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export const BottomNav = memo(BottomNavComponent);
export default BottomNav;
