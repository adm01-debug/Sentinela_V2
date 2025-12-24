import { webAuthnService } from './webAuthn';
import { fingerprintAuth } from './fingerprint';
import { faceIdAuth } from './faceId';
export type BiometricType = 'webauthn' | 'fingerprint' | 'faceid';
export class BiometricsService {
  async getSupportedMethods(): Promise<BiometricType[]> { const methods: BiometricType[] = []; if (await webAuthnService.isSupported()) methods.push('webauthn'); if (await fingerprintAuth.isSupported()) methods.push('fingerprint'); if (await faceIdAuth.isSupported()) methods.push('faceid'); return methods; }
  async authenticate(method: BiometricType): Promise<boolean> { switch (method) { case 'fingerprint': return fingerprintAuth.authenticate(); case 'faceid': return faceIdAuth.authenticate(); default: return false; } }
}
export const biometricsService = new BiometricsService();
