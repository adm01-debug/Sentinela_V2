import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryProvider>
  );
}

// Export all providers
export { QueryProvider } from "./QueryProvider";
export { ThemeProvider } from "./ThemeProvider";
export { AnalyticsProvider } from "./AnalyticsProvider";
export { FeatureFlagsProvider } from "./FeatureFlagsProvider";
export { AppProviders } from "./AppProviders";
