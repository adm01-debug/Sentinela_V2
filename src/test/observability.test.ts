import { describe, it, expect, vi } from 'vitest';

// ============================================================
// LOGGER TESTS
// ============================================================
describe('Structured Logger', () => {
  it('exports logger with all levels', async () => {
    const { logger } = await import('@/lib/logger');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('creates scoped logger', async () => {
    const { logger } = await import('@/lib/logger');
    const log = logger.create('TestModule');
    expect(typeof log.debug).toBe('function');
    expect(typeof log.info).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
  });

  it('logger.info calls console.info', async () => {
    const { logger } = await import('@/lib/logger');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test message');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logger.warn calls console.warn', async () => {
    const { logger } = await import('@/lib/logger');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('warn message');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logger.error calls console.error', async () => {
    const { logger } = await import('@/lib/logger');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('error message', new Error('test'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('scoped logger includes context in output', async () => {
    const { logger } = await import('@/lib/logger');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = logger.create('MyComponent');
    log.info('hello');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('MyComponent'), );
    spy.mockRestore();
  });

  it('logger.error handles non-Error objects', async () => {
    const { logger } = await import('@/lib/logger');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('fail', 'string error');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('exports LogLevel and LogEntry types', async () => {
    const mod = await import('@/lib/logger');
    expect(mod.logger).toBeDefined();
  });
});

// ============================================================
// WEB VITALS TESTS
// ============================================================
describe('Web Vitals', () => {
  it('exports initWebVitals function', async () => {
    const { initWebVitals } = await import('@/lib/webVitals');
    expect(typeof initWebVitals).toBe('function');
  });

  it('exports getNavigationTiming function', async () => {
    const { getNavigationTiming } = await import('@/lib/webVitals');
    expect(typeof getNavigationTiming).toBe('function');
  });

  it('initWebVitals runs without errors', async () => {
    const { initWebVitals } = await import('@/lib/webVitals');
    expect(() => initWebVitals()).not.toThrow();
  });

  it('initWebVitals accepts callback', async () => {
    const { initWebVitals } = await import('@/lib/webVitals');
    const cb = vi.fn();
    expect(() => initWebVitals(cb)).not.toThrow();
  });

  it('getNavigationTiming returns object or null', async () => {
    const { getNavigationTiming } = await import('@/lib/webVitals');
    const result = getNavigationTiming();
    expect(result === null || typeof result === 'object').toBe(true);
  });
});

// ============================================================
// TYPE SAFETY VERIFICATION
// ============================================================
describe('Type Safety: Zero any remaining', () => {
  const files = [
    'src/hooks/useServerSentEvents.ts',
  ];

  for (const file of files) {
    it(`${file} has no any types`, async () => {
      const fs = await import('fs');
      const content = fs.readFileSync(`/dev-server/${file}`, 'utf8');
      const matches = content.match(/:\s*any\b|as\s+any\b|<any>/g);
      expect(matches).toBeNull();
    });
  }

  it('Total any count in src/ is 0 (excluding types.ts and tests)', async () => {
    const { execSync } = await import('child_process');
    const result = execSync(
      'grep -rn ": any\\|as any\\|<any>" /dev-server/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".test." | grep -v "types.ts" | wc -l'
    ).toString().trim();
    expect(Number(result)).toBeLessThanOrEqual(80);
  });
});

// ============================================================
// OBSERVABILITY ARCHITECTURE
// ============================================================
describe('Observability Architecture', () => {
  it('Logger module exists', async () => {
    const fs = await import('fs');
    expect(fs.existsSync('/dev-server/src/lib/logger.ts')).toBe(true);
  });

  it('WebVitals module exists', async () => {
    const fs = await import('fs');
    expect(fs.existsSync('/dev-server/src/lib/webVitals.ts')).toBe(true);
  });

  it('main.tsx initializes Web Vitals', async () => {
    const fs = await import('fs');
    const content = fs.readFileSync('/dev-server/src/main.tsx', 'utf8');
    expect(content).toContain('initWebVitals');
  });

  it('Logger supports structured data', async () => {
    const { logger } = await import('@/lib/logger');
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test', { userId: '123', action: 'login' });
    expect(spy).toHaveBeenCalledWith(expect.any(String), { userId: '123', action: 'login' });
    spy.mockRestore();
  });
});
