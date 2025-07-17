import { IpcSendEvents, IpcInvokeEvents, IpcInvokeEvents } from './IcpEvents';
export {};

type Last<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;
type Init<T extends unknown[]> = T extends [...infer I, unknown] ? I : never;

declare global {
  interface Window {
    ipcRenderer: {
      on<K extends keyof IpcCatchEvents>(
        channel: K,
        listener: (event: IpcRendererEvent, ...args: IpcInvokeEvents[K]) => void
      ): void;
      off<K extends keyof IpcInvokeEvents>(
        channel: K,
        listener: (event: IpcRendererEvent, ...args: IpcInvokeEvents[K]) => void
      ): void;
      send<K extends keyof IpcSendEvents>(
        channel: K,
        ...args: IpcSendEvents[K]
      ): void;
      invoke<K extends keyof IpcInvokeEvents>(
        channel: K,
        ...args: Init<IpcInvokeEvents[K]>
      ): Promise<Last<IpcInvokeEvents[K]>>;
    };
  }
}
