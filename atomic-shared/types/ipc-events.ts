export interface IpcS2CEvents {
  'download-progress': [DownloadProgress];
  'splash-message': [string];
  'splash-prompt-restart': [];
  'splash-error': [string];
  'set-profile-ver': [string];
  'splash-start-download': [];
  'splash-download-progress': [number];
}

export interface IpcC2SEvents {
  play: [];
  install: [];
  update: [];
  'splash-restart': [];
}

export interface IpcC2SInvokeEvents {
  'open-settings': unknown[];
}

export interface DownloadProgress {
  stage: string;
  done: number;
  total: number;
}
