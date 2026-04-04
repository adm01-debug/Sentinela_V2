// Browser utilities for Sentinela v17

export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = '';

  if (ua.includes('Firefox/')) {
    name = 'Firefox';
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    name = 'Edge';
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    name = 'Chrome';
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    name = 'Safari';
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || '';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    name = 'Internet Explorer';
    version = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)?.[1] || '';
  }

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

  return { name, version, os, isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isServer(): boolean {
  return !isBrowser();
}

export function supportsFeature(feature: string): boolean {
  const features: Record<string, () => boolean> = {
    webgl: () => !!document.createElement('canvas').getContext('webgl'),
    webgl2: () => !!document.createElement('canvas').getContext('webgl2'),
    webp: () => document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'),
    serviceworker: () => 'serviceWorker' in navigator,
    push: () => 'PushManager' in window,
    notification: () => 'Notification' in window,
    geolocation: () => 'geolocation' in navigator,
    websocket: () => 'WebSocket' in window,
    indexeddb: () => 'indexedDB' in window,
    localstorage: () => { try { return !!localStorage; } catch { return false; } },
    sessionstorage: () => { try { return !!sessionStorage; } catch { return false; } },
    clipboard: () => 'clipboard' in navigator,
    share: () => 'share' in navigator,
    vibration: () => 'vibrate' in navigator,
    bluetooth: () => 'bluetooth' in navigator,
    usb: () => 'usb' in navigator,
    mediadevices: () => 'mediaDevices' in navigator,
    speechrecognition: () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    touchevents: () => 'ontouchstart' in window,
    pointerevents: () => 'PointerEvent' in window,
  };

  return features[feature]?.() ?? false;
}

export function getViewport(): { width: number; height: number } {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
}

export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

export function scrollTo(options: ScrollToOptions): void {
  window.scrollTo({ behavior: 'smooth', ...options });
}

export function scrollToTop(): void {
  scrollTo({ top: 0 });
}

export function scrollToElement(element: HTMLElement, offset = 0): void {
  const rect = element.getBoundingClientRect();
  scrollTo({ top: rect.top + getScrollPosition().y - offset });
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve(success);
}

export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadUrl(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || url.split('/').pop() || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function getLanguage(): string {
  return navigator.language || 'en';
}
