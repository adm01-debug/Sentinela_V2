let deferredPrompt: any = null;
export function initInstallPrompt() { window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; }); }
export function canInstall(): boolean { return deferredPrompt !== null; }
export async function promptInstall(): Promise<boolean> { if (!deferredPrompt) return false; deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; return outcome === 'accepted'; }
export function isInstalled(): boolean { return window.matchMedia('(display-mode: standalone)').matches; }
