export interface SignedDocument { content: string; signature: string; signedAt: Date; signedBy: string; }
export class DocumentSigner {
  async sign(content: string, privateKey: CryptoKey, signedBy: string): Promise<SignedDocument> { const signature = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, privateKey, new TextEncoder().encode(content)); return { content, signature: btoa(String.fromCharCode(...new Uint8Array(signature))), signedAt: new Date(), signedBy }; }
  async verify(doc: SignedDocument, publicKey: CryptoKey): Promise<boolean> { const signature = Uint8Array.from(atob(doc.signature), c => c.charCodeAt(0)); return crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, publicKey, signature, new TextEncoder().encode(doc.content)); }
}
export const documentSigner = new DocumentSigner();
