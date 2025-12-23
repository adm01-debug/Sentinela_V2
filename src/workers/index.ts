export const createWorker = (workerPath: string) => new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
export const syncWorker = () => createWorker('./syncWorker.ts');
export const notificationWorker = () => createWorker('./notificationWorker.ts');
export const screenshotWorker = () => createWorker('./screenshotWorker.ts');
export const reportWorker = () => createWorker('./reportWorker.ts');
export const analyticsWorker = () => createWorker('./analyticsWorker.ts');
