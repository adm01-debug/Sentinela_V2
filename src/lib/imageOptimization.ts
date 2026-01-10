export const getOptimizedImageUrl = (url: string, width?: number): string => {
  if (!url) return '';
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  params.set('q', '80');
  params.set('fm', 'webp');
  return `${url}?${params.toString()}`;
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};
