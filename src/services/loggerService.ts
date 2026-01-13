const levels = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel = 1;
export const loggerService = {
  setLevel: (level: keyof typeof levels) => { currentLevel = levels[level]; },
  debug: (...args: any[]) => { if (currentLevel <= 0) console.debug('[DEBUG]', ...args); },
  info: (...args: any[]) => { if (currentLevel <= 1) console.info('[INFO]', ...args); },
  warn: (...args: any[]) => { if (currentLevel <= 2) console.warn('[WARN]', ...args); },
  error: (...args: any[]) => { if (currentLevel <= 3) console.error('[ERROR]', ...args); },
};
