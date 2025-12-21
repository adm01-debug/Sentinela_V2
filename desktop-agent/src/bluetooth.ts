import { logger } from './logger';

interface BluetoothDevice { name: string; address: string; }

class BluetoothScanner {
  async scan(): Promise<BluetoothDevice[]> { logger.info('Scanning...'); return []; }
}

export const bluetooth = new BluetoothScanner();