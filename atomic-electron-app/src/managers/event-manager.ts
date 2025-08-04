import { TypedIpcMain } from '@shared/types/ipc-types';
import { app, BrowserWindow } from 'electron';
import tryInstallLatest from './profile-manager';
import logger from '@shared/utils/logger';
import launchGame from '../launcher';
import { windowManager, windowUtils } from './window-manager';
import { DownloadProgress } from '@shared/types/ipc-events';
import tryInstallVersion from '../installers/vanilla';
import installForgeClient from '../installers/forge';

const VERSION = '1.20.1';
let downloadWindow: BrowserWindow;
export default function initEventManager(ipc: TypedIpcMain): void {
  ipc.on('play', async () => {
    try {
      const profile = 'imperial';
      await tryInstallLatest(profile);
      await launchGame(profile);
      return { success: true };
    } catch (err: unknown) {
      logger.error(err);
      if (err instanceof Error) return { success: false, error: err.message };
    }
  });

  ipc.on('install', async () => {
    console.log('Starting download for version:', VERSION);
    try {
      downloadWindow = windowUtils.createDownloadWindow();

      await tryInstallVersion(VERSION, handleProgress);

      console.log('Download complete, installing Forge client...');

      await installForgeClient('1.20.1-forge-47.4.2', handleProgress).catch(
        console.error
      );

      downloadWindow.close();

      return { success: true };
    } catch (err: unknown) {
      logger.error(err);
      if (err instanceof Error) return { success: false, error: err };
    }
  });

  ipc.on('splash-restart', () => {
    app.relaunch();
  });
}

function handleProgress(progress: DownloadProgress) {
  windowManager.ipcFromWin(downloadWindow).send('download-progress', progress);
}
