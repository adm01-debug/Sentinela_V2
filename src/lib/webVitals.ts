export const reportWebVitals = (metric: any) => {
  console.log(metric);
  // Send to analytics
};

export const measurePerformance = () => {
  if ('performance' in window) {
    const timing = performance.timing;
    return {
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
    };
  }
  return null;
};
