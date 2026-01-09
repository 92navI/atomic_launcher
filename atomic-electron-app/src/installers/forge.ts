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
  // Parse vanilla and forge versions from version string
  const [mcVersion, , forgeVersion] = version.split('-');

  // Check if version is installed already
  const versionListPath = p.join(Paths.VERSIONS_DIR, 'versions.json');
  const versionList = await loadJson(versionListPath, VersionConfigSchema);
  if (versionList.includes(version)) {
    logger.info(`Forge version ${forgeVersion} already installed.`);
    return;
  }

  // Download forge installer
  const forgeURL = `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${forgeVersion}/forge-${mcVersion}-${forgeVersion}-installer.jar`;
  const INSTALLER_JAR = p.join(Paths.TEMP_DIR, `${version}-installer.jar`);

  try {
    await downloadFile(forgeURL, INSTALLER_JAR, undefined, progressCallback);
    logger.info('Forge installer downloaded.');
  } catch (err) {
    logger.error(`Error downloading Forge installer: ${err}`);
    return;
  }

  // Make temporary launcher profiles for installer
  const launcherProfilesPath = p.join(Paths.BASE_DIR, 'launcher_profiles.json');
  if (!fs.existsSync(launcherProfilesPath)) {
    const jsonString = JSON.stringify(launcherProfilesJson, null, 2);
    fs.writeFileSync(launcherProfilesPath, jsonString);
    logger.info('Created launcher_profiles.json.');
  }

  const args = ['-jar', INSTALLER_JAR, '--installClient', Paths.BASE_DIR];

  logger.info('Launching Forge installer...');
  windowManager.getIpc('download')?.send('download-progress', {
    done: 100,
    total: 100,
    stage: 'Running forge installer...',
  });

  // Launch installer
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(Paths.getJavaPath(), args, { stdio: 'inherit' });

    child.on('error', reject);

    child.on('close', resolve);
  });

  if (exitCode === 0) {
    logger.info('Forge installed successfully.');

    // Update version json that the version is installed
    versionList.push(version);
    writeJson(versionListPath, versionList);

    // Remove temporary launcer profiles
    fs.rmSync(launcherProfilesPath);
  } else {
    throw new Error(`Forge installer failed with exit code ${exitCode}`);
  }
}
