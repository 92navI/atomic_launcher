const fs = require('fs');
const path = require('path');
const { downloadFile } = require('./util/fetch');
const axios = require('axios');
const { BrowserWindow, ipcMain } = require('electron');
const isDev = require('./config')
const AdmZip = require('adm-zip');
const Paths = require('./util/paths');
const installForgeClient = require('./install/forge.js');

const VERSION = '1.20.1';
const INSTANCE = 'hotv-13-1.0';

module.exports = (mainWindow) => {
  ipcMain.handle('start-download', async () => {
    console.log('Starting download for version:', VERSION);
    try {
      let downloadWindow = createDownloadWindow();

      await installVersion(VERSION,
        (progress) => downloadWindow.webContents.send('download-progress', progress));

      console.log('Download complete, installing Forge client...');

      await installForgeClient((progress) => downloadWindow.webContents.send('download-progress', progress)).catch(console.error);

      downloadWindow.close();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message, stack: err.stack };
    }
  });
};

function createDownloadWindow() {
  let win = new BrowserWindow({
    title: 'Atomic Downloader',
    width: isDev ? 1100 : 700,
    height: 180,
    skipTaskbar: true,
    resizable: false,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, '../preload/download.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Open devtools if in dev env
  if (isDev) win.webContents.openDevTools();

  win.loadFile(path.join(__dirname, '../ui/download/index.html'));

  return win;
}

async function installVersion(version, progressCallback) {
  const VERSION_DIR = Paths.getVersionPath(version);
  const NATIVE_DIR = Paths.getNativesPath(version);

  const manifestURL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';
  const { data: manifest } = await axios.get(manifestURL);

  const versionMeta = manifest.versions.find(v => v.id === version);
  if (!versionMeta) throw new Error(`Base version ${version} not found`);

  const { data: versionJson } = await axios.get(versionMeta.url);

  const versionPath = Paths.getVersionPath(version);
  fs.mkdirSync(versionPath, { recursive: true });

  fs.writeFileSync(path.join(versionPath, `${version}.json`), JSON.stringify(versionJson, null, 2));
  await downloadFile(versionJson.downloads.client.url,
    path.join(versionPath, `${version}.jar`),
    versionJson.downloads.client.sha1,
    progressCallback);

  // Download libraries
  const osKey = getOSNativeKey();
  for (const [index, lib] of versionJson.libraries.entries()) {
    const allow = !lib.rules || allowLibrary(lib.rules);
    if (!allow) continue;

    const artifact = lib.downloads?.artifact;

    if (artifact) {
      const libPath = path.join(Paths.LIB_DIR, artifact.path);
      fs.mkdirSync(path.dirname(libPath), { recursive: true });
      await downloadFile(artifact.url, libPath, artifact.sha1);
      progressCallback({
        stage: 'Downloading Libraries',
        filename: lib.name,
        done: index,
        total: versionJson.libraries.length
      });

      // Handle natives
      if (lib.name.includes(osKey) && lib.name.includes('natives')) {
        const jarPath = path.join(Paths.TEMP_DIR, artifact.path);
        await downloadFile(artifact.url, jarPath, artifact.sha1);
        progressCallback({
          stage: 'Downloading Libraries',
          filename: lib.name,
          done: index,
          total: versionJson.libraries.length
        });

        fs.mkdirSync(path.dirname(NATIVE_DIR), { recursive: true });
        const zip = new AdmZip(jarPath);
        zip.getEntries().forEach(entry => {
          if (!entry.isDirectory && /\.(dll|so|dylib)$/.test(entry.entryName)) {
            zip.extractEntryTo(entry, NATIVE_DIR, false, true);
          }
        });
      }
    }
  }

  const logConfigFile = versionJson.logging.client.file;
  const logConfigDir = path.join(Paths.ASSETS_DIR, 'log_configs', logConfigFile.id);
  await downloadFile(logConfigFile.url, logConfigDir, logConfigFile.sha1);
  progressCallback({
    stage: 'Downloading Log Config',
    filename: logConfigFile.id,
    done: 1,
    total: 1
  });

  // Download Assets
  const assetIndexUrl = versionJson.assetIndex.url;
  const assetIndexId = versionJson.assetIndex.id;
  const { data: assetIndex } = await axios.get(assetIndexUrl);

  // Save asset index
  const indexPath = path.join(Paths.ASSETS_DIR, 'indexes', `${assetIndexId}.json`);
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(assetIndex, null, 2));

  // Iterate through assets
  const assetObjects = assetIndex.objects;
  for (const [index, [name, obj]] of Object.entries(assetObjects).entries()) {
    const hash = obj.hash;
    const subDir = hash.substring(0, 2);
    const url = `https://resources.download.minecraft.net/${subDir}/${hash}`;
    const assetPath = path.join(Paths.ASSETS_DIR, 'objects', subDir, hash);
    fs.mkdirSync(path.dirname(assetPath), { recursive: true });
    await downloadFile(url, assetPath, hash);
    progressCallback({
      stage: 'Downloading Assets',
      filename: name,
      done: index,
      total: Object.keys(assetObjects).length
    });
  }

  console.log('Forge installation complete!');
}

function allowLibrary(rules) {
  for (const rule of rules) {
    if (rule.action === 'allow' && (!rule.os || rule.os.name === process.platform)) return true;
    if (rule.action === 'disallow' && rule.os?.name === process.platform) return false;
  }
  return true;
}

function getOSNativeKey() {
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'macos';
  return 'linux';
}