import { systemPreferences, dialog } from 'electron';

interface PermissionStatus {
  screen: boolean;
  accessibility: boolean;
  camera: boolean;
  microphone: boolean;
}

class PermissionManager {
  async checkAll(): Promise<PermissionStatus> {
    return {
      screen: await this.checkScreen(),
      accessibility: await this.checkAccessibility(),
      camera: await this.checkCamera(),
      microphone: await this.checkMicrophone(),
    };
  }

  async checkScreen(): Promise<boolean> {
    if (process.platform === 'darwin') {
      const status = systemPreferences.getMediaAccessStatus('screen');
      return status === 'granted';
    }
    return true;
  }

  async checkAccessibility(): Promise<boolean> {
    if (process.platform === 'darwin') {
      return systemPreferences.isTrustedAccessibilityClient(false);
    }
    return true;
  }

  async checkCamera(): Promise<boolean> {
    const status = systemPreferences.getMediaAccessStatus('camera');
    return status === 'granted';
  }

  async checkMicrophone(): Promise<boolean> {
    const status = systemPreferences.getMediaAccessStatus('microphone');
    return status === 'granted';
  }

  async requestScreen(): Promise<boolean> {
    if (process.platform === 'darwin') {
      const { response } = await dialog.showMessageBox({
        type: 'info',
        title: 'Screen Recording Permission',
        message: 'Sentinela needs screen recording permission to capture screenshots.',
        buttons: ['Open System Preferences', 'Cancel'],
      });
      if (response === 0) {
        const { shell } = require('electron');
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
      }
    }
    return this.checkScreen();
  }

  async requestAccessibility(): Promise<boolean> {
    if (process.platform === 'darwin') {
      return systemPreferences.isTrustedAccessibilityClient(true);
    }
    return true;
  }
}

export const permissions = new PermissionManager();
