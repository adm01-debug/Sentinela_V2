const imageCache = new Map<string, string>();

export async function cacheImage(url: string): Promise<string> {
  if (imageCache.has(url)) return imageCache.get(url)!;
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  imageCache.set(url, objectUrl);
  return objectUrl;
}

export function getCachedImage(url: string): string | undefined {
  return imageCache.get(url);
}

export function clearImageCache() {
  imageCache.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
  imageCache.clear();
}
