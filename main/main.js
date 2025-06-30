const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const {isDev, isMac} = require('./config.js')
const setupDownloader = require('./installer.js');
const setupLauncher = require('./launcher');

// const isDev = process.env.NODE_ENV !== 'production';

app.whenReady().then(() => {
    
    // Hide menu
    Menu.setApplicationMenu(null);

    //Open main window
    mainWindow = createMainWindow();

    setupDownloader(mainWindow);
    setupLauncher(mainWindow);
})


function createMainWindow() {
    win = new BrowserWindow({
        title: 'Atomic Launcher',
        width: isDev ? 1300 : 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/main.js'),
            contextIsolation: true,
            nodeIntegration: false
        }

    });

    // Open devtools if in dev env
    if (isDev) win.webContents.openDevTools();

    win.loadFile(path.join(__dirname, '../ui/main/index.html'));

    // TODO: this!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // win.webContents.send('setMainMenuButton', );c

    return win;
}

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})
