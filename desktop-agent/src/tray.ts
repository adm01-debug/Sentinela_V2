import { Tray, Menu, nativeImage, app } from 'electron';
import * as path from 'path';

interface TrayConfig {
  onShowWindow: () => void;
  onQuit: () => void;
  onToggleMonitoring: () => void;
}

class TrayManager {
  private tray: Tray | null = null;
  private isMonitoring = false;

  create(config: TrayConfig) {
    const iconPath = path.join(__dirname, '../assets/tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    this.tray.setToolTip('Sentinela Agent');
    
    this.updateMenu(config);

    this.tray.on('click', config.onShowWindow);
  }

  updateMenu(config: TrayConfig) {
    if (!this.tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Window',
        click: config.onShowWindow,
      },
      { type: 'separator' },
      {
        label: this.isMonitoring ? 'Pause Monitoring' : 'Resume Monitoring',
        click: () => {
          this.isMonitoring = !this.isMonitoring;
          config.onToggleMonitoring();
          this.updateMenu(config);
        },
      },
      { type: 'separator' },
      {
        label: 'Status: ' + (this.isMonitoring ? 'Active' : 'Paused'),
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: config.onQuit,
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  setStatus(status: 'active' | 'paused' | 'error') {
    if (!this.tray) return;
    
    const tooltips = {
      active: 'Sentinela Agent - Active',
      paused: 'Sentinela Agent - Paused',
      error: 'Sentinela Agent - Error',
    };
    
    this.tray.setToolTip(tooltips[status]);
  }

  destroy() {
    this.tray?.destroy();
    this.tray = null;
  }
}

export const trayManager = new TrayManager();
