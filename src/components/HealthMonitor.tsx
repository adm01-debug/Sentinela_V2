import { useEffect, useState } from 'react';
import { runHealthCheck } from '@/lib/apiMonitor';

export function HealthMonitor() {
  const [, setStatus] = useState<'stable' | 'slow' | 'offline'>('stable');

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await runHealthCheck();
      
      if (!result.ok) {
        setStatus('offline');
        // We could trigger a global notification here if needed
      } else if (result.latency > 3000) {
        setStatus('slow');
      } else {
        setStatus('stable');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything, it's just a background monitor
  return null;
}
