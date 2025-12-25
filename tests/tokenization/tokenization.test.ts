import { Tokenizer } from '../../tokenization';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;
  beforeEach(() => { tokenizer = new Tokenizer(); });

  it('should tokenize sensitive data', async () => {
    const token = await tokenizer.tokenize('4111111111111111');
    expect(token).not.toBe('4111111111111111');
    expect(token.length).toBeGreaterThan(0);
  });

  it('should detokenize', async () => {
    const original = '4111111111111111';
    const token = await tokenizer.tokenize(original);
    const recovered = await tokenizer.detokenize(token);
    expect(recovered).toBe(original);
  });
});
