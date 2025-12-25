/**
 * Security patterns example
 */
import { DLPScanner, Tokenizer, Encryptor, RoleManager, Authorizer } from '@sentinela/core';

// DLP - Data Loss Prevention
async function dlpExample() {
  const scanner = new DLPScanner();
  const text = 'Email: user@example.com, SSN: 123-45-6789';
  const result = await scanner.scan(text);
  console.log('DLP findings:', result.findings);
  const redacted = await scanner.redact(text);
  console.log('Redacted:', redacted);
}

// Tokenization
async function tokenizationExample() {
  const tokenizer = new Tokenizer();
  const sensitive = '4111111111111111';
  const token = await tokenizer.tokenize(sensitive);
  console.log('Token:', token);
  const original = await tokenizer.detokenize(token);
  console.log('Original:', original);
}

// Encryption
async function encryptionExample() {
  const encryptor = new Encryptor({ algorithm: 'aes-256-gcm' });
  const encrypted = await encryptor.encrypt('secret data');
  const decrypted = await encryptor.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
}

// RBAC
async function rbacExample() {
  const roleManager = new RoleManager();
  await roleManager.createRole('admin', ['read', 'write', 'delete']);
  await roleManager.createRole('viewer', ['read']);
  await roleManager.assignRole('user-123', 'viewer');
  
  const authorizer = new Authorizer(roleManager);
  console.log('Can read:', await authorizer.can('user-123', 'read'));
  console.log('Can delete:', await authorizer.can('user-123', 'delete'));
}

Promise.all([dlpExample(), tokenizationExample(), encryptionExample(), rbacExample()]);
