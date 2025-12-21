import { exec } from 'child_process';

export async function getActiveApp(): Promise<{ name: string; title: string }> {
  return { name: 'Unknown', title: 'Unknown' };
}

export function trackApp(callback: (app: { name: string; title: string }) => void) {
  setInterval(async () => callback(await getActiveApp()), 5000);
}