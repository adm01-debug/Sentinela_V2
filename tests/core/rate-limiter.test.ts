import { RateLimiter, TokenBucket } from '../../core/rate-limiter';
import { RateLimitError } from '../../core/errors';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000
    });
  });

  afterEach(() => {
    limiter.dispose();
  });

  it('should allow requests within limit', () => {
    const result1 = limiter.consume('user1');
    const result2 = limiter.consume('user1');
    
    expect(result1.allowed).toBe(true);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it('should block when limit exceeded', () => {
    limiter.consume('user1');
    limiter.consume('user1');
    limiter.consume('user1');
    const result = limiter.consume('user1');
    
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeDefined();
  });

  it('should throw on consumeOrThrow', async () => {
    limiter.consume('user1');
    limiter.consume('user1');
    limiter.consume('user1');
    
    await expect(limiter.consumeOrThrow('user1')).rejects.toThrow(RateLimitError);
  });

  it('should reset for user', () => {
    limiter.consume('user1');
    limiter.consume('user1');
    limiter.reset('user1');
    
    const result = limiter.check('user1');
    expect(result.remaining).toBe(3);
  });
});

describe('TokenBucket', () => {
  it('should allow consumption within capacity', () => {
    const bucket = new TokenBucket(10, 1);
    
    expect(bucket.tryConsume(5)).toBe(true);
    expect(bucket.getAvailableTokens()).toBe(5);
  });

  it('should reject when not enough tokens', () => {
    const bucket = new TokenBucket(5, 1);
    
    bucket.tryConsume(5);
    expect(bucket.tryConsume(1)).toBe(false);
  });

  it('should refill over time', async () => {
    const bucket = new TokenBucket(10, 10);
    
    bucket.tryConsume(10);
    await new Promise(r => setTimeout(r, 100));
    
    expect(bucket.getAvailableTokens()).toBeGreaterThan(0);
  });
});
