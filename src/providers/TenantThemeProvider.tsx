import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/** Convert #RRGGBB (or #RGB) → "H S% L%" string usable in Tailwind HSL variables. */
function hexToHslString(hex: string): string | null {
  const m = hex.trim().replace(/^#/, '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface CompanyThemeSettings {
  primary?: string;
  accent?: string;
}

interface CompanySettings {
  theme?: CompanyThemeSettings;
}

/**
 * P4 — Theming por tenant.
 * Loads the current user's company theme (`companies.settings.theme`) and applies
 * it as CSS variables on :root. Automatically reverts on unmount/sign-out.
 *
 * Company owners can persist `{ theme: { primary: "#3b82f6", accent: "#..." } }`
 * in `companies.settings` — expects hex; safely ignored if invalid.
 */
export function useTenantTheme() {
  const { user } = useAuth();

  const { data: settings } = useQuery({
    queryKey: ['tenant-theme', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CompanySettings | null> => {
      const { data: companyId, error: rpcError } = await supabase.rpc(
        'get_user_company_id',
        { _user_id: user!.id },
      );
      if (rpcError || !companyId) return null;
      const { data } = await supabase
        .from('companies')
        .select('settings')
        .eq('id', companyId)
        .maybeSingle();
      return (data?.settings as CompanySettings | null) ?? null;
    },
  });

  useEffect(() => {
    const theme = settings?.theme;
    if (!theme) return;
    const root = document.documentElement;
    const prevPrimary = root.style.getPropertyValue('--primary');
    const prevAccent = root.style.getPropertyValue('--accent');

    if (theme.primary) {
      const hsl = hexToHslString(theme.primary);
      if (hsl) root.style.setProperty('--primary', hsl);
    }
    if (theme.accent) {
      const hsl = hexToHslString(theme.accent);
      if (hsl) root.style.setProperty('--accent', hsl);
    }

    return () => {
      if (prevPrimary) root.style.setProperty('--primary', prevPrimary);
      else root.style.removeProperty('--primary');
      if (prevAccent) root.style.setProperty('--accent', prevAccent);
      else root.style.removeProperty('--accent');
    };
  }, [settings]);
}

/** Silent provider — mounts the hook. */
export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  useTenantTheme();
  return <>{children}</>;
}
