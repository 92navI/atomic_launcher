import * as p from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import { isDev, isMac } from '@shared/utils/config.js';
import { windowManager } from './managers/window-manager.js';
import logger from '@shared/utils/logger.js';
import { updateManager } from './managers/update-manager.js';

app.whenReady().then(async () => {
  logger.info('App started');

  // Hide menu
  logger.info('Hiding menu');
  Menu.setApplicationMenu(null);

  logger.info('Creating main window');
  createMainWindow();

  await updateManager.checkForUpdates();

  setTimeout(() => {
    windowManager.get('splash')?.destroy();
    windowManager.get('main')?.show();
  }, 10000);
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
      width: isDev ? 1300 : 800,
      height: 600,
      show: false,
    },
    p.join(app.getAppPath(), './dist/src/index.html')
  );
}
