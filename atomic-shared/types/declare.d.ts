import { IpcEvents } from './IcpEvents';
export {};

declare global {
  interface Window {
    ipcRenderer: {
      on<K extends keyof IpcEvents>(
        channel: K,
        listener: (event: IpcRendererEvent, ...args: IpcEvents[K]) => void
      ): void;
      off<K extends keyof IpcEvents>(
        channel: K,
        listener: (event: IpcRendererEvent, ...args: IpcEvents[K]) => void
      ): void;
      send<K extends keyof IpcEvents>(channel: K, ...args: IpcEvents[K]): void;
      invoke<K extends keyof IpcEvents>(
        channel: K,
        ...args: IpcEvents[K]
      ): Promise<unknown>;
    };
  }
}
