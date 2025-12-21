import { session } from 'electron';

export async function setProxy(url: string) {
  await session.defaultSession.setProxy({ proxyRules: url });
}

export async function clearProxy() {
  await session.defaultSession.setProxy({ proxyRules: '' });
}