export const analyzeBundleSize = (): void => {
  if (typeof window === 'undefined') return;
  
  const resources = performance.getEntriesByType('resource');
  const jsResources = resources.filter(r => r.name.endsWith('.js'));
  
  const totalSize = jsResources.reduce((acc, r: any) => acc + (r.transferSize || 0), 0);
  
  console.log('Bundle Analysis:', {
    totalJS: `${(totalSize / 1024).toFixed(2)} KB`,
    files: jsResources.length,
  });
};
