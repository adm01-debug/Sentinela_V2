import { useEffect } from 'react';

export function useSecurityHeaders() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline';";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);
}
