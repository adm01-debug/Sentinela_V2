export const measureRenderTime = (componentName: string) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (duration > 16) console.warn(`Slow render: ${componentName} took ${duration}ms`);
  };
};
