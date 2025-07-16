export interface IpcEvents {
  play: [];
  'download-progress': [DownloadProgress];
  install: [];
}

export interface DownloadProgress {
  stage: string;
  filename: string;
  done: number;
  total: number;
}
