import { Tokenizer } from '../../tokenization';
describe('Tokenizer', () => {
  let tokenizer: Tokenizer;
  beforeEach(() => { tokenizer = new Tokenizer(); });
  it('should tokenize and detokenize', async () => {
    const token = await tokenizer.tokenize('4111111111111111');
    expect(token).toMatch(/^tok_/);
    const original = await tokenizer.detokenize(token);
    expect(original).toBe('4111111111111111');
  });
  it('should return same token for same value', async () => {
    const token1 = await tokenizer.tokenize('sensitive');
    const token2 = await tokenizer.tokenize('sensitive');
    expect(token1).toBe(token2);
  });
});
