export class FingerprintAuth {
  async isSupported(): Promise<boolean> { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  async authenticate(): Promise<boolean> { try { const credential = await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), timeout: 60000, userVerification: 'required', rpId: window.location.hostname } }); return !!credential; } catch { return false; } }
}
export const fingerprintAuth = new FingerprintAuth();
