import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcEvents } from '@shared/types/IcpEvents';

type Listener<K extends keyof IpcEvents> = (
  event: IpcRendererEvent,
  ...args: IpcEvents[K]
) => void;

contextBridge.exposeInMainWorld('ipcRenderer', {
  on<K extends keyof IpcEvents>(channel: K, listener: Listener<K>) {
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...(args as IpcEvents[K]))
    );
  },

  off<K extends keyof IpcEvents>(channel: K, listener: Listener<K>) {
    return ipcRenderer.off(channel, listener);
  },

  send<K extends keyof IpcEvents>(channel: K, ...args: IpcEvents[K]) {
    return ipcRenderer.send(channel, ...args);
  },

  invoke<K extends keyof IpcEvents>(
    channel: K,
    ...args: IpcEvents[K]
  ): Promise<unknown> {
    return ipcRenderer.invoke(channel, ...args);
  },
});
