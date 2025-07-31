import { IpcC2SEvents, IpcS2CEvents, IpcC2SInvokeEvents } from './ipc-events';
import { Init, Last } from './util-types';
export {};

// --- RENDERER SIDE IPC ---
declare global {
  interface Window {
    ipcRenderer: {
      on<K extends keyof IpcS2CEvents>(
        channel: K,
        listener: (event: IpcRendererEvent, ...args: IpcS2CEvents[K]) => void
      ): void;
      off<K extends keyof IpcS2CEvents>(
        channel: K,
        listener: (event: IpcRendererEvent, ...args: IpcS2CEvents[K]) => void
      ): void;
      send<K extends keyof IpcC2SEvents>(
        channel: K,
        ...args: IpcC2SEvents[K]
      ): void;
      invoke<K extends keyof IpcC2SInvokeEvents>(
        channel: K,
        ...args: Init<IpcC2SInvokeEvents[K]>
      ): Promise<Last<IpcC2SInvokeEvents[K]>>;
    };
  }
}

// --- MAIN PROCESS SIDE IPC ---
export interface TypedIpcMain {
  handle<K extends keyof IpcC2SInvokeEvents>(
    channel: K,
    listener: (
      event: IpcMainInvokeEvent,
      ...args: Init<IpcC2SInvokeEvents[K]>
    ) => Last<IpcC2SInvokeEvents[K]> | Promise<Last<IpcC2SInvokeEvents[K]>>
  ): void;

  on<K extends keyof IpcC2SEvents>(
    channel: K,
    listener: (event: IpcMainEvent, ...args: IpcC2SEvents[K]) => void
  ): void;
}

// --- MAIN TO RENDERER EMIT ---
export interface TypedWebContents {
  send<K extends keyof IpcS2CEvents>(
    channel: K,
    ...args: IpcS2CEvents[K]
  ): void;
}
