export class WebAuthnService {
  async isSupported(): Promise<boolean> { return !!window.PublicKeyCredential; }
  async register(userId: string, username: string): Promise<Credential | null> { const challenge = crypto.getRandomValues(new Uint8Array(32)); const options: PublicKeyCredentialCreationOptions = { challenge, rp: { name: 'Sentinela', id: window.location.hostname }, user: { id: new TextEncoder().encode(userId), name: username, displayName: username }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }], timeout: 60000, attestation: 'none' }; return navigator.credentials.create({ publicKey: options }); }
  async authenticate(credentialId: ArrayBuffer): Promise<Credential | null> { const challenge = crypto.getRandomValues(new Uint8Array(32)); const options: PublicKeyCredentialRequestOptions = { challenge, allowCredentials: [{ type: 'public-key', id: credentialId }], timeout: 60000 }; return navigator.credentials.get({ publicKey: options }); }
}
export const webAuthnService = new WebAuthnService();
