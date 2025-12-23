const cache = new Map<string, string>();
const MAX_SIZE = 100;

export const imageCache = {
  get: (url: string): string | undefined => cache.get(url),
  set: (url: string, blob: string) => {
    if (cache.size >= MAX_SIZE) {
      const first = cache.keys().next().value;
      if (first) cache.delete(first);
    }
    cache.set(url, blob);
  },
  has: (url: string): boolean => cache.has(url),
  clear: () => cache.clear(),
  size: () => cache.size,
};

export const preloadImage = async (url: string): Promise<string> => {
  if (imageCache.has(url)) return imageCache.get(url)!;
  const res = await fetch(url);
  const blob = URL.createObjectURL(await res.blob());
  imageCache.set(url, blob);
  return blob;
};
