const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
    startDownload: () => ipcRenderer.invoke('start-download'),
    launchGame: () => ipcRenderer.invoke('launch-game'),
    setMainMenuButton: (data) => ipcRenderer.on('set-button', data)
});
