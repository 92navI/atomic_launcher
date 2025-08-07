import * as p from 'path';
import { downloadFile } from '../util/fetch';
import Paths from '../util/paths';
import logger from '@shared/utils/logger';
import axios from 'axios';
import {
  LatestProfileVersion,
  LatestProfileVersionSchema,
  ProfileConfigSchema,
} from '@shared/types/json-schemas';
import { compareVersions } from 'compare-versions';
import tryInstallVersion from '../installers/vanilla';
import installForgeClient from '../installers/forge';
import { windowManager, windowUtils } from './window-manager';
import { DownloadProgress } from '@shared/types/ipc-events';
import { loadJson, writeJson } from '../util/json';
import { unzipDirectory } from '../util/zip';
import tryInstallJre from '../installers/jre';

export default async function tryInstallLatest(profile: string) {
  const profileId = profile + '@latest';

  let currentVersion;
  const profilesJsonPath = p.join(Paths.INSTANCES_DIR, 'profiles.json');
  const profilesJson =
    (await loadJson(profilesJsonPath, ProfileConfigSchema)) ?? {};
  if (Object.keys(profilesJson).includes(profileId))
    currentVersion = profilesJson[profileId].version;

  const { data: latestVersionRaw } = await axios.get(
    `https://atomicverbucket.s3.eu-north-1.amazonaws.com/${profile}/latest.json`
  );
  const latestVersion: LatestProfileVersion =
    LatestProfileVersionSchema.parse(latestVersionRaw);

  if (
    !currentVersion ||
    compareVersions(currentVersion, latestVersion.id) == -1
  ) {
    const zipPath = p.join(
      Paths.TEMP_DIR,
      `${profile}-${latestVersion.id}-compressed.zip`
    );
    await downloadFile(
      `https://atomicverbucket.s3.eu-north-1.amazonaws.com/${profile}/${latestVersion.file}`,
      zipPath
    );

    const profilePath = p.join(Paths.INSTANCES_DIR, profileId);
    await unzipDirectory(zipPath, profilePath);

    profilesJson[profileId] = {
      version: latestVersion.id,
      minecraft: latestVersion.minecraft,
    };
    await writeJson(profilesJsonPath, profilesJson);
    if (currentVersion)
      logger.info(
        `Profile ${profile} was updated from ${currentVersion} to ${latestVersion.id}.`
      );
    else logger.info(`Profile ${profile} was installed sucessfully.`);
    windowManager.getIpc('main')?.send('set-profile-ver', latestVersion.id);
  } else {
    logger.info(
      `Version ${currentVersion} of profile ${profile} is up to date.`
    );
    windowManager.getIpc('main')?.send('set-profile-ver', currentVersion);
  }

  await installMcVersion(
    latestVersion.minecraft.version,
    latestVersion.minecraft.type,
    latestVersion.minecraft.vanillaVersion
  );
}

export async function installMcVersion(
  version: string,
  type: 'vanilla' | 'forge',
  mcVersion?: string
) {
  tryInstallJre();
  if (type == 'vanilla') {
    await tryInstallVersion(version, handleProgress);
  } else if (type == 'forge' && mcVersion) {
    windowUtils.createDownloadWindow();
    await tryInstallVersion(mcVersion, handleProgress);
    await installForgeClient(version, handleProgress);
    windowManager.get('download')?.close();
  }
}
function handleProgress(progress: DownloadProgress) {
  windowManager.getIpc('download')?.send('download-progress', progress);
}
