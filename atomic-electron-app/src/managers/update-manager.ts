import { autoUpdater } from 'electron-updater';
import { windowManager } from './window-manager';
import { app, BrowserWindow, ipcMain } from 'electron';
import * as p from 'path';
import logger from '@shared/utils/logger';
import { isDev } from '@shared/utils/config';

autoUpdater.autoDownload = false;
autoUpdater.forceDevUpdateConfig = isDev;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.autoRunAppAfterInstall = true;

export const updateManager = {
  async checkForUpdates() {
    createSplashWindow().on('ready-to-show', async () => {
      windowManager.get('splash')?.show();

      await runAutoUpdater();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      windowManager.get('splash')?.destroy();
      windowManager.get('main')?.show();
    });
  },
  restartAndInstall() {
    autoUpdater.quitAndInstall(false, true);
  },
};

async function runAutoUpdater(): Promise<void> {
  return new Promise((resolve, reject) => {
    autoUpdater.on('update-available', (info) => {
      const msg = `Found version ${info.version} newer than current version ${autoUpdater.currentVersion}. Downloading...`;
      logger.info(msg);
      windowManager.getIpc('splash')?.send('splash-start-download');
      autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-downloaded', () => {
      logger.info('Update downloaded, prompting to restart');
      windowManager.getIpc('splash')?.send('splash-prompt-restart');
    });

    autoUpdater.on('download-progress', (progress) => {
      logger.info(`Download progress: ${progress.percent.toFixed(2)}%`);
      windowManager
        .getIpc('splash')
        ?.send('splash-download-progress', progress.percent);
    });

    autoUpdater.on('update-not-available', () => {
      const msg = `Current version ${autoUpdater.currentVersion} is up to date.`;
      logger.info(msg);
      windowManager.getIpc('splash')?.send('splash-message', msg);
      resolve();
    });

    autoUpdater.on('error', (err) => {
      logger.error(`A fatal error occured while fetching github: ${err}`);
      windowManager
        .getIpc('splash')
        ?.send('splash-error', 'A fatal error occured when updating.');
      reject(err);
    });

    ipcMain.on('splash-restart', () => {
      autoUpdater.quitAndInstall();
      resolve();
    });

    autoUpdater.checkForUpdates();
  });
}
function createSplashWindow(): BrowserWindow {
  return windowManager.createWindow(
    'splash',
    {
      width: 400,
      height: 400,
      skipTaskbar: true,
      resizable: false,
      frame: false,
      transparent: true,
      show: false,
      center: true,
      titleBarStyle: 'hidden',
    },
    p.join(app.getAppPath(), './dist/src/windows/splash/index.html'),
    false
  );
}
