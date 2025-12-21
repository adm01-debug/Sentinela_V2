export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  lastFour: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}