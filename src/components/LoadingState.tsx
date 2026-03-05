import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const Spinner = LoadingSpinner;
export const LoadingState = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
    <LoadingSpinner size="lg" />
    {message && <p className="text-muted-foreground text-sm">{message}</p>}
  </div>
);
export default LoadingState;
