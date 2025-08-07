import * as fs from 'fs';
import * as p from 'path';
import Paths from '../util/paths';
import { downloadFile } from '../util/fetch';
import { unzipDirectory } from '../util/zip';
import logger from '@shared/utils/logger';

export default async function tryInstallJre() {
  if (!fs.existsSync(Paths.getJavaPath())) {
    const zipPath = p.join(Paths.TEMP_DIR, 'jre.zip');
    await downloadFile(
      `https://atomicverbucket.s3.eu-north-1.amazonaws.com/jre/jre.zip`,
      zipPath
    );
    unzipDirectory(zipPath, Paths.JRE_DIR);
    logger.info('Jre installed sucessfully');
  } else logger.info('Jre already installed');
}
