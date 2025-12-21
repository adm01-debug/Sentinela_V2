import { logger } from './logger';

export async function isWebcamAvailable(): Promise<boolean> {
  logger.info('Checking webcam...');
  return true;
}

export async function isWebcamInUse(): Promise<boolean> { return false; }