import * as fs from 'fs';
import * as path from 'path';
import { cryptoService } from './crypto';

// ============================================================
// STORAGE SEGURO
// Armazena dados criptografados localmente
// ============================================================

interface StorageData {
  [key: string]: unknown;
}

interface StorageMetadata {
  version: number;
  lastModified: string;
  checksum: string;
}

class SecureStorage {
  private storagePath: string;
  private metadataPath: string;
  private data: StorageData = {};
  private initialized = false;

  constructor(userDataPath?: string) {
    const basePath = userDataPath || process.cwd();
    this.storagePath = path.join(basePath, '.sentinela_storage.enc');
    this.metadataPath = path.join(basePath, '.sentinela_storage.meta');
  }

  /**
   * Inicializa o storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Garantir que crypto está inicializado
    if (!cryptoService.isInitialized()) {
      await cryptoService.initialize();
    }

    // Carregar dados existentes
    if (fs.existsSync(this.storagePath)) {
      await this.load();
    }

    this.initialized = true;
  }

  /**
   * Carrega dados do arquivo criptografado
   */
  private async load(): Promise<void> {
    try {
      const encryptedData = fs.readFileSync(this.storagePath, 'utf8');
      this.data = cryptoService.decrypt<StorageData>(encryptedData);

      // Verificar integridade
      if (fs.existsSync(this.metadataPath)) {
        const metadata: StorageMetadata = JSON.parse(
          fs.readFileSync(this.metadataPath, 'utf8')
        );
        const checksum = cryptoService.hash(JSON.stringify(this.data));
        
        if (!cryptoService.verifyHash(JSON.stringify(this.data), metadata.checksum)) {
          console.warn('Aviso: Checksum do storage não confere, dados podem estar corrompidos');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar storage:', error);
      this.data = {};
    }
  }

  /**
   * Salva dados criptografados
   */
  private async save(): Promise<void> {
    const checksum = cryptoService.hash(JSON.stringify(this.data));
    const encryptedData = cryptoService.encrypt(this.data);

    // Salvar dados criptografados
    fs.writeFileSync(this.storagePath, encryptedData, { mode: 0o600 });

    // Salvar metadata
    const metadata: StorageMetadata = {
      version: 1,
      lastModified: new Date().toISOString(),
      checksum,
    };
    fs.writeFileSync(this.metadataPath, JSON.stringify(metadata), { mode: 0o600 });
  }

  /**
   * Obtém um valor
   */
  get<T = unknown>(key: string): T | null {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    return (this.data[key] as T) || null;
  }

  /**
   * Define um valor
   */
  async set(key: string, value: unknown): Promise<void> {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    this.data[key] = value;
    await this.save();
  }

  /**
   * Remove um valor
   */
  async remove(key: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    delete this.data[key];
    await this.save();
  }

  /**
   * Verifica se uma chave existe
   */
  has(key: string): boolean {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    return key in this.data;
  }

  /**
   * Lista todas as chaves
   */
  keys(): string[] {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    return Object.keys(this.data);
  }

  /**
   * Limpa todo o storage
   */
  async clear(): Promise<void> {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    this.data = {};
    await this.save();
  }

  /**
   * Exporta dados (descriptografados) para backup
   */
  export(): StorageData {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    return { ...this.data };
  }

  /**
   * Importa dados de backup
   */
  async import(data: StorageData): Promise<void> {
    if (!this.initialized) {
      throw new Error('SecureStorage não inicializado');
    }
    this.data = { ...data };
    await this.save();
  }
}

// ============================================================
// STORAGE ESPECIALIZADO PARA CREDENCIAIS
// ============================================================

interface Credentials {
  apiKey: string;
  serverUrl: string;
  deviceId: string;
  employeeId?: string;
  refreshToken?: string;
}

class CredentialStorage {
  private storage: SecureStorage;
  private readonly CREDENTIALS_KEY = 'credentials';

  constructor(storage: SecureStorage) {
    this.storage = storage;
  }

  async getCredentials(): Promise<Credentials | null> {
    return this.storage.get<Credentials>(this.CREDENTIALS_KEY);
  }

  async setCredentials(credentials: Credentials): Promise<void> {
    await this.storage.set(this.CREDENTIALS_KEY, credentials);
  }

  async clearCredentials(): Promise<void> {
    await this.storage.remove(this.CREDENTIALS_KEY);
  }

  async updateToken(refreshToken: string): Promise<void> {
    const current = await this.getCredentials();
    if (current) {
      await this.setCredentials({ ...current, refreshToken });
    }
  }
}

// ============================================================
// STORAGE ESPECIALIZADO PARA FILA OFFLINE
// ============================================================

interface QueuedData {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
  retries: number;
}

class OfflineQueueStorage {
  private storage: SecureStorage;
  private readonly QUEUE_KEY = 'offline_queue';

  constructor(storage: SecureStorage) {
    this.storage = storage;
  }

  async getQueue(): Promise<QueuedData[]> {
    return this.storage.get<QueuedData[]>(this.QUEUE_KEY) || [];
  }

  async addToQueue(type: string, data: unknown): Promise<string> {
    const queue = await this.getQueue();
    const id = cryptoService.generateToken(16);
    
    queue.push({
      id,
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    });

    await this.storage.set(this.QUEUE_KEY, queue);
    return id;
  }

  async removeFromQueue(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await this.storage.set(this.QUEUE_KEY, filtered);
  }

  async incrementRetry(id: string): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find(item => item.id === id);
    if (item) {
      item.retries++;
      await this.storage.set(this.QUEUE_KEY, queue);
    }
  }

  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  async clearQueue(): Promise<void> {
    await this.storage.set(this.QUEUE_KEY, []);
  }
}

// Singleton instances
export const secureStorage = new SecureStorage();
export const credentialStorage = new CredentialStorage(secureStorage);
export const offlineQueueStorage = new OfflineQueueStorage(secureStorage);

// Export classes for testing
export { SecureStorage, CredentialStorage, OfflineQueueStorage };
