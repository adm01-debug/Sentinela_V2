import { logger } from './logger';

interface USBDevice { name: string; vendorId: number; productId: number; }

export async function getUSBDevices(): Promise<USBDevice[]> {
  logger.info('Scanning USB...');
  return [];
}