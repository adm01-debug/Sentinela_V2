import { base64Encode, base64Decode, hexEncode, hexDecode } from '../../core/encoding';
describe('Encoding', () => {
  it('should encode/decode base64', () => { expect(base64Decode(base64Encode('test'))).toBe('test'); });
  it('should encode/decode hex', () => { expect(hexDecode(hexEncode('test'))).toBe('test'); });
});
