import { useMemo } from "react";

interface Breadcrumb {
  label: string;
  href: string;
}

export function useBreadcrumbs(pathname: string, labelMap: Record<string, string> = {}) {
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    
    return segments.map((segment, index): Breadcrumb => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href };
    });
  }, [pathname, labelMap]);
}
