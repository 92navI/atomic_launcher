import * as p from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import { isDev, isMac } from '@shared/utils/config.js';
import initInstaller from './installer.js';
import initLauncher from './launcher.js';
import { windowManager } from './window-manager.js';
import logger from '@shared/utils/logger.js';

app.whenReady().then(() => {
  logger.info('App started');

  // Hide menu
  logger.info('Hiding menu');
  Menu.setApplicationMenu(null);

  // Open main window
  logger.info('Creating main window');
  createMainWindow();

  initInstaller();
  initLauncher();
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
    },
    p.join(app.getAppPath(), './dist/src/index.html')
  );
}
