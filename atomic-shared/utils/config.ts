import { app } from 'electron';

// export const logLevel: string = process.env.LOG_LEVEL || 'info';
export const logLevel: string = 'debug';
export const isDev: boolean = !app.isPackaged;
export const isMac: boolean = process.platform === 'darwin';
