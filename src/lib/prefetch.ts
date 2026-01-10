export const prefetchRoute = (path: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = path;
  document.head.appendChild(link);
};

export const prefetchData = async (url: string): Promise<void> => {
  try {
    await fetch(url, { method: 'GET', cache: 'force-cache' });
  } catch (error) {
    console.warn('Prefetch failed:', url);
  }
};
