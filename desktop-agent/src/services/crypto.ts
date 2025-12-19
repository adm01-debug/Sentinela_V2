import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// SERVIÇO DE CRIPTOGRAFIA AES-256-GCM
// Para proteção de dados sensíveis no Desktop Agent
// ============================================================

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

interface EncryptedData {
  iv: string;
  authTag: string;
  data: string;
  version: number;
}

interface KeyData {
  salt: string;
  iterations: number;
  algorithm: string;
  created: string;
}

class CryptoService {
  private masterKey: Buffer | null = null;
  private keyFilePath: string;
  private initialized = false;

  constructor(userDataPath?: string) {
    const basePath = userDataPath || process.cwd();
    this.keyFilePath = path.join(basePath, '.sentinela_key');
  }

  /**
   * Inicializa o serviço de criptografia
   */
  async initialize(passphrase?: string): Promise<void> {
    if (this.initialized) return;

    try {
      if (fs.existsSync(this.keyFilePath)) {
        await this.loadMasterKey(passphrase);
      } else {
        await this.generateMasterKey(passphrase);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar criptografia:', error);
      throw new Error('Falha na inicialização da criptografia');
    }
  }

  /**
   * Gera senha aleatória segura
   */
  private generateRandomPassphrase(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Gera uma nova chave mestra
   */
  private async generateMasterKey(passphrase?: string): Promise<void> {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const password = passphrase || this.generateRandomPassphrase();

    this.masterKey = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );

    const keyData: KeyData = {
      salt: salt.toString('base64'),
      iterations: PBKDF2_ITERATIONS,
      algorithm: ALGORITHM,
      created: new Date().toISOString(),
    };

    fs.writeFileSync(
      this.keyFilePath,
      JSON.stringify(keyData),
      { mode: 0o600 }
    );

    if (!passphrase) {
      process.env.SENTINELA_KEY_PASSPHRASE = password;
    }
  }

  /**
   * Carrega a chave mestra existente
   */
  private async loadMasterKey(passphrase?: string): Promise<void> {
    const keyDataRaw = fs.readFileSync(this.keyFilePath, 'utf8');
    const keyData: KeyData = JSON.parse(keyDataRaw);

    const password = passphrase || process.env.SENTINELA_KEY_PASSPHRASE;
    if (!password) {
      throw new Error('Passphrase necessária para descriptografar');
    }

    const salt = Buffer.from(keyData.salt, 'base64');

    this.masterKey = crypto.pbkdf2Sync(
      password,
      salt,
      keyData.iterations,
      KEY_LENGTH,
      'sha512'
    );
  }

  /**
   * Criptografa dados usando AES-256-GCM
   */
  encrypt(data: string | object): string {
    if (!this.masterKey) {
      throw new Error('CryptoService não inicializado');
    }

    const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    const result: EncryptedData = {
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      data: encrypted,
      version: 1,
    };

    return Buffer.from(JSON.stringify(result)).toString('base64');
  }

  /**
   * Descriptografa dados
   */
  decrypt<T = string>(encryptedString: string): T {
    if (!this.masterKey) {
      throw new Error('CryptoService não inicializado');
    }

    const encryptedData: EncryptedData = JSON.parse(
      Buffer.from(encryptedString, 'base64').toString('utf8')
    );

    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    const encrypted = encryptedData.data;

    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as T;
    }
  }

  /**
   * Criptografa um arquivo
   */
  encryptFile(inputPath: string, outputPath: string): void {
    if (!this.masterKey) {
      throw new Error('CryptoService não inicializado');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const input = fs.readFileSync(inputPath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Formato: IV (16) + AuthTag (16) + Encrypted Data
    const output = Buffer.concat([iv, authTag, encrypted]);
    fs.writeFileSync(outputPath, output);
  }

  /**
   * Descriptografa um arquivo
   */
  decryptFile(inputPath: string, outputPath: string): void {
    if (!this.masterKey) {
      throw new Error('CryptoService não inicializado');
    }

    const input = fs.readFileSync(inputPath);

    const iv = input.subarray(0, IV_LENGTH);
    const authTag = input.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = input.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.masterKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    fs.writeFileSync(outputPath, decrypted);
  }

  /**
   * Gera hash seguro de dados (para verificação de integridade)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Compara hash de forma segura (timing-safe)
   */
  verifyHash(data: string, expectedHash: string): boolean {
    const actualHash = this.hash(data);
    return crypto.timingSafeEqual(
      Buffer.from(actualHash),
      Buffer.from(expectedHash)
    );
  }

  /**
   * Gera token aleatório
   */
  generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Limpa a chave da memória (para logout/shutdown)
   */
  clearKey(): void {
    if (this.masterKey) {
      this.masterKey.fill(0);
      this.masterKey = null;
    }
    this.initialized = false;
  }

  /**
   * Verifica se o serviço está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const cryptoService = new CryptoService();

// Export class for testing
export { CryptoService };
