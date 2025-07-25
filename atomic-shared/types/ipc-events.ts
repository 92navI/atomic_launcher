export interface IpcS2CEvents {
  'download-progress': [DownloadProgress];
  'update-message': [string];
  'update-error': [Error];
}

export interface IpcC2SEvents {
  play: [];
  install: [];
}

export interface IpcC2SInvokeEvents {
  'open-settings': unknown[];
}

export interface DownloadProgress {
  stage: string;
  filename: string;
  done: number;
  total: number;
}
