const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
    onDownloadProgress: (progress) => ipcRenderer.on('download-progress', progress),
});
