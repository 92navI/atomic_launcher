import * as p from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import Paths from '../util/paths.js';
import { downloadFile } from '../util/fetch.js';
import { DownloadProgress } from '@shared/types/ipc-events.js';
import logger from '@shared/utils/logger.js';
import { loadJson, writeJson } from '../util/json.js';
import { VersionConfigSchema } from '@shared/types/json-schemas.js';

const launcherProfilesJson = {
  profiles: {},
  selectedProfile: 'default',
  clientToken: '00000000-0000-0000-0000-000000000000',
  authenticationDatabase: {},
  settings: {},
  version: 3,
};

export default async function installForgeClient(
  version: string,
  progressCallback?: (progress: DownloadProgress) => void
): Promise<void> {
  const versionListPath = p.join(Paths.VERSIONS_DIR, 'versions.json');
  let versionList =
    (await loadJson(versionListPath, VersionConfigSchema)) ?? [];
  if (versionList.includes(version)) return;

  const forgeURL = `https://maven.minecraftforge.net/net/minecraftforge/forge/1.20.1-47.4.2/forge-1.20.1-47.4.2-installer.jar`;

  console.log(`Downloading Forge installer for ${version}...`);

  const INSTALLER_JAR = p.join(Paths.TEMP_DIR, `${version}-installer.jar`);

  try {
    await downloadFile(forgeURL, INSTALLER_JAR, null, progressCallback);
    console.log('Forge installer downloaded.');
  } catch (err) {
    console.error(`Error downloading Forge installer: ${err}`);
    return;
  }
  const launcherProfilesPath = p.join(Paths.BASE_DIR, 'launcher_profiles.json');
  if (!fs.existsSync(launcherProfilesPath)) {
    const jsonString = JSON.stringify(launcherProfilesJson, null, 2);

    fs.writeFile(launcherProfilesPath, jsonString, (err) => {
      if (err) {
        throw err;
      }
      logger.info('Created launcher_profiles.json.');
    });
  }

  // Launch installer
  const args = ['-jar', INSTALLER_JAR, '--installClient', Paths.BASE_DIR];

  const forgeInstall = spawn(Paths.getJavaPath(), args, { stdio: 'inherit' });

  forgeInstall.on('close', (code) => {
    if (code === 0) {
      console.log('Forge installed successfully.');

      if (!versionList.includes(version))
        versionList = [...versionList, version];
      writeJson(versionListPath, versionList);

      fs.rmSync(launcherProfilesPath);
    } else {
      console.error(`Forge installer exited with code ${code}`);
    }
  });
}
