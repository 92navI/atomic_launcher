import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { isDev } from '@shared/utils/config.js';
import * as p from 'path';
import logger from '@shared/utils/logger';
import { TypedWebContents } from '@shared/types/ipc-types';

const windows = new Map<string, BrowserWindow>();

export const windowManager = {
  createWindow(
    id: string,
    options: BrowserWindowConstructorOptions,
    htmlPath: string,
    devtools: boolean = true
  ): BrowserWindow {
    if (windows.has(id)) return windows.get(id)!;
    logger.info(`Started ${id} window creation`);

    const win = new BrowserWindow({
      ...options,
      title: 'atomic-launcher',
      webPreferences: {
        preload: p.join(
          app.getAppPath(),
          './dist-electron/preload/preload.mjs'
        ),
        contextIsolation: true,
        nodeIntegration: false,
        ...options.webPreferences,
      },
    });

    if (isDev && devtools) win.webContents.openDevTools();

    logger.info('Loading window contents');
    if (isDev) win.loadURL(`http://localhost:5173/${id}.html`);
    else {
      logger.info(htmlPath);
      win.loadFile(htmlPath);
    }
    win.on('closed', () => windows.delete(id));

    logger.info(`${id} window creation complete`);
    windows.set(id, win);
    return win;
  },

  get(id: string): BrowserWindow | null {
    return windows.get(id) ?? null;
  },

  getIpc(id: string): TypedWebContents | null {
    return (windows.get(id)?.webContents as TypedWebContents) ?? null;
  },

  ipcFromWin(win: BrowserWindow): TypedWebContents {
    return win.webContents as TypedWebContents;
  },

  close(id: string): void {
    windows.get(id)?.close();
  },
};

export const windowUtils = {
  createDownloadWindow(): BrowserWindow {
    return windowManager.createWindow(
      'download',
      {
        width: isDev ? 1100 : 700,
        height: 180,
        // skipTaskbar: true,
        resizable: false,
        frame: false,
        titleBarStyle: 'hidden',
      },
      p.join(app.getAppPath(), './dist/src/windows/download/index.html')
    );
  },
};
