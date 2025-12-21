import { logger } from './logger';

class MicrophoneDetector {
  async isAvailable(): Promise<boolean> { return true; }
  async isMuted(): Promise<boolean> { return false; }
}

export const microphone = new MicrophoneDetector();