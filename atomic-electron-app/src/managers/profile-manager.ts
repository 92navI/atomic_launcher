import * as p from 'path';
import { downloadFile } from '../util/fetch';
import Paths from '../util/paths';
import logger from '@shared/utils/logger';
import axios from 'axios';
import {
  LatestProfileVersion,
  LatestProfileVersionSchema,
} from '@shared/types/json-schemas';
import AdmZip from 'adm-zip';
import { compareVersions } from 'compare-versions';

const CURRENT_VERSION = '1.0.0';

export default async function tryInstallLatest(profile: string) {
  const { data: latestVersionRaw } = await axios.get(
    `https://atomicverbucket.s3.eu-north-1.amazonaws.com/${profile}/latest.json`
  );
  const latestVersion: LatestProfileVersion =
    LatestProfileVersionSchema.parse(latestVersionRaw);

  if (compareVersions(CURRENT_VERSION, latestVersion.id) != -1) {
    logger.info(
      `Version ${CURRENT_VERSION} of profile ${profile} is up to date.`
    );
    return;
  }

  const zipPath = p.join(
    Paths.TEMP_DIR,
    `${profile}-${latestVersion.id}-compressed.zip`
  );
  downloadFile(
    `https://atomicverbucket.s3.eu-north-1.amazonaws.com/${profile}/${latestVersion.file}`,
    zipPath
  );

  const profilePath = p.join(Paths.INSTANCES_DIR, profile + '@latest');
  unzipDirectory(zipPath, profilePath);

  logger.info(
    `Profile ${profile} was updated from ${CURRENT_VERSION} to ${latestVersion.id}.`
  );
  return true;
}

function unzipDirectory(
  inputFilePath: string,
  outputDirectory: string
): Promise<void> {
  const zip = new AdmZip(inputFilePath);
  return new Promise((resolve, reject) => {
    zip.extractAllToAsync(
      outputDirectory,
      true,
      true,
      (error?: Error | undefined) => {
        if (error) {
          logger.error(error);
          reject(error);
        } else {
          logger.info(`Extracted to "${outputDirectory}" successfully`);
          resolve();
        }
      }
    );
  });
}
