import { CircuitBreaker, getCircuitBreaker } from '../../core/circuit-breaker';
import { CircuitBreakerOpenError } from '../../core/errors';

describe('CircuitBreaker', () => {
  let circuit: CircuitBreaker;

  beforeEach(() => {
    circuit = new CircuitBreaker({
      name: 'test',
      failureThreshold: 3,
      successThreshold: 2,
      resetTimeout: 1000,
      volumeThreshold: 3
    });
  });

  afterEach(() => {
    circuit.dispose();
  });

  it('should start in closed state', () => {
    expect(circuit.getState()).toBe('closed');
  });

  it('should execute function successfully', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const result = await circuit.execute(fn);
    
    expect(result).toBe('result');
    expect(circuit.getState()).toBe('closed');
  });

  it('should open after failure threshold', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    
    for (let i = 0; i < 3; i++) {
      try {
        await circuit.execute(fn);
      } catch {}
    }
    
    expect(circuit.getState()).toBe('open');
  });

  it('should throw when open', async () => {
    circuit.forceOpen();
    
    await expect(circuit.execute(() => Promise.resolve('test')))
      .rejects.toThrow(CircuitBreakerOpenError);
  });

  it('should track metrics', async () => {
    await circuit.execute(() => Promise.resolve('ok'));
    
    const metrics = circuit.getMetrics();
    expect(metrics.successes).toBe(1);
    expect(metrics.requests).toBe(1);
  });
});

describe('getCircuitBreaker', () => {
  it('should return same instance for same name', () => {
    const cb1 = getCircuitBreaker('shared');
    const cb2 = getCircuitBreaker('shared');
    
    expect(cb1).toBe(cb2);
  });
});
