export class QRCodeGenerator {
  generateOTPAuthURL(issuer: string, account: string, secret: string): string { return 'otpauth://totp/' + encodeURIComponent(issuer) + ':' + encodeURIComponent(account) + '?secret=' + secret + '&issuer=' + encodeURIComponent(issuer); }
  async generateQRDataURL(data: string, size = 200): Promise<string> { const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(data); return qrApiUrl; }
}
export const qrCodeGenerator = new QRCodeGenerator();
