import * as p from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import Paths from '../util/paths.js';
import { downloadFile } from '../util/fetch.js';
import { DownloadProgress } from '@shared/types/ipc-events.js';
import logger from '@shared/utils/logger.js';
import { loadJson, writeJson } from '../util/json.js';
import { VersionConfigSchema } from '@shared/types/json-schemas.js';
import { windowManager } from '../managers/window-manager.js';

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
  const [mcVersion, , forgeVersion] = version.split('-');

  const versionListPath = p.join(Paths.VERSIONS_DIR, 'versions.json');
  const versionList = await loadJson(versionListPath, VersionConfigSchema);
  if (versionList.includes(version)) {
    logger.info(`Forge version ${forgeVersion} already installed.`);
    return;
  }
  const forgeURL = `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${forgeVersion}/forge-${mcVersion}-${forgeVersion}-installer.jar`;
  const INSTALLER_JAR = p.join(Paths.TEMP_DIR, `${version}-installer.jar`);

  try {
    await downloadFile(forgeURL, INSTALLER_JAR, undefined, progressCallback);
    console.log('Forge installer downloaded.');
  } catch (err) {
    console.error(`Error downloading Forge installer: ${err}`);
    return;
  }

  const launcherProfilesPath = p.join(Paths.BASE_DIR, 'launcher_profiles.json');
  if (!fs.existsSync(launcherProfilesPath)) {
    const jsonString = JSON.stringify(launcherProfilesJson, null, 2);
    fs.writeFileSync(launcherProfilesPath, jsonString);
    logger.info('Created launcher_profiles.json.');
  }

  const args = ['-jar', INSTALLER_JAR, '--installClient', Paths.BASE_DIR];

  console.log('Launching Forge installer...');
  windowManager.getIpc('download')?.send('download-progress', {
    done: 100,
    total: 100,
    stage: 'Running forge installer...',
    filename: `${version}-installer.jar`,
  });

  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(Paths.getJavaPath(), args, { stdio: 'inherit' });

    child.on('error', reject);

    child.on('close', resolve);
  });

  if (exitCode === 0) {
    console.log('Forge installed successfully.');

    versionList.push(version);
    await writeJson(versionListPath, versionList);

    fs.rmSync(launcherProfilesPath);
  } else {
    console.error(`Forge installer exited with code ${exitCode}`);
    throw new Error(`Forge installer failed with exit code ${exitCode}`);
  }
}
