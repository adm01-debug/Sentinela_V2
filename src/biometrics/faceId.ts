export class FaceIdAuth {
  async isSupported(): Promise<boolean> { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  async authenticate(): Promise<boolean> { try { const options: PublicKeyCredentialRequestOptions = { challenge: crypto.getRandomValues(new Uint8Array(32)), timeout: 60000, userVerification: 'required' }; const credential = await navigator.credentials.get({ publicKey: options }); return !!credential; } catch { return false; } }
}
export const faceIdAuth = new FaceIdAuth();
