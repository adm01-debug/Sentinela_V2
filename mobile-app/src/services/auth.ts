import * as SecureStore from 'expo-secure-store';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('auth_token', token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync('auth_token');
}
