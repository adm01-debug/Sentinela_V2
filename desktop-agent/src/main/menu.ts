import { Menu, app } from 'electron';

export function createMenu(): void {
  const template = [
    { label: 'File', submenu: [{ label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }] },
  ];
  
  Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));
}
