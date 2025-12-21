import { crashReporter } from 'electron';

export function initCrashReporter() {
  crashReporter.start({
    productName: 'Sentinela',
    companyName: 'Sentinela',
    submitURL: process.env.CRASH_REPORT_URL || '',
    uploadToServer: true,
  });
}