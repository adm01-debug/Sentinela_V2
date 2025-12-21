import * as keytar from 'keytar';

const SERVICE = 'sentinela';

export async function setPassword(account: string, password: string): Promise<void> {
  await keytar.setPassword(SERVICE, account, password);
}

export async function getPassword(account: string): Promise<string | null> {
  return keytar.getPassword(SERVICE, account);
}