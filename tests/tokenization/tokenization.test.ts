import { Tokenizer, TokenStore, TokenFormat } from '../../tokenization';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer({
      format: 'uuid',
      preserveFormat: false
    });
  });

  it('should tokenize sensitive data', async () => {
    const sensitive = '4111-1111-1111-1111';
    const token = await tokenizer.tokenize(sensitive);

    expect(token).not.toBe(sensitive);
    expect(token).toMatch(/^[a-f0-9-]{36}$/);
  });

  it('should detokenize back to original', async () => {
    const sensitive = 'secret-data-123';
    const token = await tokenizer.tokenize(sensitive);
    const detokenized = await tokenizer.detokenize(token);

    expect(detokenized).toBe(sensitive);
  });

  it('should preserve format when configured', async () => {
    const formatPreserving = new Tokenizer({
      format: 'preserve',
      preserveFormat: true
    });

    const cardNumber = '4111111111111111';
    const token = await formatPreserving.tokenize(cardNumber);

    // Should be same length and format
    expect(token.length).toBe(cardNumber.length);
    expect(/^\d+$/.test(token)).toBe(true);
  });
});

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    store = new TokenStore();
  });

  it('should store and retrieve tokens', async () => {
    await store.store('token-1', 'value-1');
    const value = await store.retrieve('token-1');

    expect(value).toBe('value-1');
  });

  it('should delete tokens', async () => {
    await store.store('token-2', 'value-2');
    await store.delete('token-2');
    const value = await store.retrieve('token-2');

    expect(value).toBeNull();
  });
});
