import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const Spinner = LoadingSpinner;
export const LoadingState = ({ message }: { message?: string }) => (
  <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
    <LoadingSpinner size="lg" />
    {message && <p className="text-sm text-muted-foreground">{message}</p>}
  </div>
);
export default LoadingState;
