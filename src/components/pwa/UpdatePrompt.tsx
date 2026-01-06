import * as React from 'react';
import { useState, useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { RefreshCw, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface UpdatePromptProps {
  className?: string;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function UpdatePrompt({
  className,
  position = 'bottom',
  autoHide = false,
  autoHideDelay = 30000,
}: UpdatePromptProps) {
  const { isUpdateAvailable, skipWaiting, update } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isUpdateAvailable) {
      setIsVisible(true);
      if (autoHide) {
        const timer = setTimeout(() => setIsVisible(false), autoHideDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [isUpdateAvailable, autoHide, autoHideDelay]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setProgress(10);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      skipWaiting();
      setProgress(100);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in',
        position === 'top' ? 'top-4 slide-in-from-top-5' : 'bottom-4 slide-in-from-bottom-5',
        className
      )}
    >
      <Card className="border-blue-500/20 shadow-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Download className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Update Available</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A new version of Sentinela is available. Update now to get the latest features and fixes.
              </p>
              {isUpdating ? (
                <div className="mt-3">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Updating... {progress}%</p>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleUpdate} className="gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Update Now
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>Later</Button>
                </div>
              )}
            </div>
            {!isUpdating && (
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UpdatePrompt;
