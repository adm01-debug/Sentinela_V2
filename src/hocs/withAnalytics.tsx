import { ComponentType, useEffect } from 'react';

export function withAnalytics<P extends object>(Component: ComponentType<P>, pageName: string) {
  return function WithAnalytics(props: P) {
    useEffect(() => {
      // Track page view
      console.log(`Page view: ${pageName}`);
    }, []);
    return <Component {...props} />;
  };
}