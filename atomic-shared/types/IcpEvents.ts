export interface IpcCatchEvents {
  'download-progress': [DownloadProgress];
}

export interface IpcSendEvents {
  play: [];
  install: [];
}

export interface IpcInvokeEvents {
  'open-settings': unknown;
}

export interface DownloadProgress {
  stage: string;
  filename: string;
  done: number;
  total: number;
}
