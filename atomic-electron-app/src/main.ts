import * as p from 'path';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { isDev, isMac } from '@shared/utils/config.js';
import { windowManager } from './managers/window-manager.js';
import logger from '@shared/utils/logger.js';
// import { updateManager } from './managers/update-manager.js';
import initEventManager from './managers/event-manager.js';
import { TypedIpcMain } from '@shared/types/ipc-types.js';

app.whenReady().then(async () => {
  logger.info('App started');

  // Hide menu
  Menu.setApplicationMenu(null);

  createMainWindow();

  const typedIpcMain = ipcMain as TypedIpcMain;
  initEventManager(typedIpcMain);

  windowManager.get('main')?.show();
  // await updateManager.checkForUpdates();
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

function createMainWindow(): BrowserWindow {
  return windowManager.createWindow(
    'main',
    {
      width: 800,
      height: 600,
      show: false,
      frame: false,
      transparent: true,
      titleBarStyle: 'hidden',
      // expose window controls in Windows/Linux
      ...(process.platform !== 'darwin'
        ? {
            titleBarOverlay: {
              color: '#1b1919',
              // symbolColor: '#e66400',
              symbolColor: '#ffffffff',
            },
          }
        : {}),
    },
    p.join(app.getAppPath(), './dist/src/index.html'),
    isDev
  );
}
