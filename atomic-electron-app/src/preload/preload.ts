import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type {
  IpcS2CEvents,
  IpcC2SEvents,
  IpcC2SInvokeEvents,
} from '@shared/types/ipc-events';
import type { Init, Last } from '@shared/types/utils';

contextBridge.exposeInMainWorld('ipcRenderer', {
  on<K extends keyof IpcS2CEvents>(
    channel: K,
    listener: (event: IpcRendererEvent, ...args: IpcS2CEvents[K]) => void
  ) {
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...(args as IpcS2CEvents[K]))
    );
  },

  off<K extends keyof IpcS2CEvents>(
    channel: K,
    listener: (event: IpcRendererEvent, ...args: IpcS2CEvents[K]) => void
  ) {
    return ipcRenderer.off(channel, listener);
  },

  send<K extends keyof IpcC2SEvents>(channel: K, ...args: IpcC2SEvents[K]) {
    return ipcRenderer.send(channel, ...args);
  },

  invoke<K extends keyof IpcC2SInvokeEvents>(
    channel: K,
    ...args: Init<IpcC2SInvokeEvents[K]>
  ): Promise<Last<IpcC2SInvokeEvents[K]>> {
    return ipcRenderer.invoke(channel, ...args);
  },
});
