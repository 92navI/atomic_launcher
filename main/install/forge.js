const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const Paths = require('../util/paths');
const { downloadFile } = require('../util/fetch');

const GAME_DIR = Paths.BASE_DIR;
const VERSION = '1.20.1-forge-47.4.2';
const VERSION1 = '1.20.1-47.4.2';
const INSTALLER_DIR = path.join(GAME_DIR, 'installers');
const INSTALLER_JAR = path.join(INSTALLER_DIR, `forge-1.20.1-47.4.2-installer.jar`);

async function installForgeClient(progressCallback) {
  fs.mkdirSync(INSTALLER_DIR, { recursive: true });

  const forgeURL = `https://maven.minecraftforge.net/net/minecraftforge/forge/1.20.1-47.4.2/forge-1.20.1-47.4.2-installer.jar`;

  console.log(`Downloading Forge installer for ${VERSION}...`);

  try {
    await downloadFile(forgeURL, INSTALLER_JAR, null, progressCallback);
    console.log('Forge installer downloaded.');
  } catch (err) {
    console.error(`Error downloading Forge installer: ${err}`);
    return;
  }

  // Launch installer
  const args = [
    '-jar',
    INSTALLER_JAR,
    '--installClient',
    GAME_DIR
  ];

  // const args = [
  //   `-Dminecraft.home=${installDir}`,
  //   '-jar',
  //   installerPath,
  //   '--installClient'
  // ];

  const forgeInstall = spawn(Paths.getJavaPath(), args, { stdio: 'inherit' });

  forgeInstall.on('close', (code) => {
    if (code === 0) {
      console.log('Forge installed successfully.');
    } else {
      console.error(`Forge installer exited with code ${code}`);
    }
  });
}

module.exports = installForgeClient;
