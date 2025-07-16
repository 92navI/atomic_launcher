import * as p from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import Paths from '../util/path-manager.js';
import { downloadFile } from '../util/fetch.js';
import { DownloadProgress } from '@shared/types/IcpEvents.js';

const GAME_DIR = Paths.BASE_DIR;
const VERSION = '1.20.1-forge-47.4.2';
const INSTALLER_DIR = p.join(GAME_DIR, 'installers');
const INSTALLER_JAR = p.join(
  INSTALLER_DIR,
  `forge-1.20.1-47.4.2-installer.jar`
);

export default async function installForgeClient(
  progressCallback?: (progress: DownloadProgress) => void
): Promise<void> {
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
  const args = ['-jar', INSTALLER_JAR, '--installClient', GAME_DIR];

  const forgeInstall = spawn(Paths.getJavaPath(), args, { stdio: 'inherit' });

  forgeInstall.on('close', (code) => {
    if (code === 0) {
      console.log('Forge installed successfully.');
    } else {
      console.error(`Forge installer exited with code ${code}`);
    }
  });
}
