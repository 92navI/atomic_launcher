import { autoUpdater } from 'electron-updater';
import { windowManager } from './window-manager';
import { app, BrowserWindow } from 'electron';
import * as p from 'path';
import logger from '@shared/utils/logger';

autoUpdater.autoDownload = true;
autoUpdater.forceDevUpdateConfig = true;
autoUpdater.autoInstallOnAppQuit = true;

export const updateManager = {
  checkForUpdates() {
    this.createSplashWindow().on('ready-to-show', async () => {
      windowManager.get('splash')?.show();
      await runAutoUpdater();
    });
  },

  createSplashWindow(): BrowserWindow {
    return windowManager.createWindow(
      'splash',
      {
        width: 400,
        height: 400,
        skipTaskbar: true,
        resizable: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        show: false,
        center: true,
        titleBarStyle: 'hidden',
      },
      p.join(app.getAppPath(), './dist/src/windows/splash/index.html'),
      false
    );
  },
};

function runAutoUpdater(): Promise<void> {
  return new Promise((resolve, reject) => {
    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', (info) => {
      const msg = `Found version ${info.version} newer than current version ${autoUpdater.currentVersion}. Downloading...`;
      logger.info(msg);
      windowManager.getIpc('splash')?.send('update-message', msg);
    });

    autoUpdater.on('update-downloaded', () => {
      const msg = `Update downloaded, you will be prompted to restart.`;
      logger.info(msg);
      windowManager.getIpc('splash')?.send('update-message', msg);
    });

    autoUpdater.on('update-not-available', () => {
      const msg = `Current version ${autoUpdater.currentVersion} is up to date.`;
      logger.info(msg);
      windowManager.getIpc('splash')?.send('update-message', msg);
      resolve();
    });

    autoUpdater.on('error', (err) => {
      logger.error(`A fatal error occured while fetching github: ${err}`);
      windowManager.getIpc('splash')?.send('update-error', err);
      reject(err);
    });
  });
}
