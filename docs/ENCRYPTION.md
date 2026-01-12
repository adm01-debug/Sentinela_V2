# Encryption Guide

## Overview
Data encryption standards and implementation for Sentinela.

## Encryption at Rest

### Database Encryption
```hcl
# RDS encryption configuration
resource "aws_db_instance" "main" {
  storage_encrypted = true
  kms_key_id        = aws_kms_key.rds.arn
}
```

### Field-Level Encryption
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":");
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
```

### Encrypted Fields
| Table | Field | Encryption |
|-------|-------|------------|
| users | ssn | AES-256-GCM |
| api_keys | key_hash | SHA-256 |
| sessions | data | AES-256-GCM |
| audit_logs | details | AES-256-GCM |

## Encryption in Transit

### TLS Configuration
```nginx
# Nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_stapling on;
ssl_stapling_verify on;
```

### Certificate Management
```bash
# Certificate renewal (Let's Encrypt)
certbot renew --quiet --post-hook "systemctl reload nginx"

# Certificate monitoring
openssl s_client -connect api.sentinela.app:443 -servername api.sentinela.app | 
  openssl x509 -noout -dates
```

## Key Management

### AWS KMS Integration
```typescript
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

const kms = new KMSClient({ region: process.env.AWS_REGION });

async function encryptWithKMS(plaintext: Buffer): Promise<Buffer> {
  const command = new EncryptCommand({
    KeyId: process.env.KMS_KEY_ID,
    Plaintext: plaintext,
  });
  
  const response = await kms.send(command);
  return response.CiphertextBlob;
}
```

### Key Rotation
```bash
# Rotate data encryption key
./scripts/rotate-encryption-key.sh

# Steps:
# 1. Generate new key
# 2. Re-encrypt all sensitive data
# 3. Update key reference
# 4. Verify encryption
# 5. Archive old key
```

## Password Hashing

### Bcrypt Configuration
```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Security Standards

### Compliance
- SOC 2 Type II
- GDPR compliant
- HIPAA ready

### Audit
- Annual penetration testing
- Quarterly key rotation
- Continuous monitoring

## Related Documentation
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [DATA_PRIVACY.md](./DATA_PRIVACY.md)
- [COMPLIANCE_GUIDE.md](./COMPLIANCE_GUIDE.md)

