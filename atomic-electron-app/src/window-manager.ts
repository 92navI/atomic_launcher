import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { isDev } from '@shared/utils/config.js';
import * as p from 'path';
import logger from '@shared/utils/logger';

export class WindowManager {
  private windows = new Map<string, BrowserWindow>();

  createWindow(
    id: string,
    options: BrowserWindowConstructorOptions,
    htmlPath: string
  ): BrowserWindow {
    if (this.windows.has(id)) return this.windows.get(id)!;
    logger.info('Staring creaton');

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

    logger.info('Opening devtools');
    if (isDev) win.webContents.openDevTools();

    logger.info('Loading window');
    if (isDev) win.loadURL(`http://localhost:5173/${id}.html`);
    else {
      logger.info(htmlPath);
      win.loadFile(htmlPath);
    }
    win.on('closed', () => this.windows.delete(id));

    logger.info('done');
    this.windows.set(id, win);
    return win;
  }

  get(id: string): BrowserWindow | null {
    return this.windows.get(id) ?? null;
  }

  close(id: string): void {
    this.windows.get(id)?.close();
  }
}
