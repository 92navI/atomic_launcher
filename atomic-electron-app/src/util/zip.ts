import logger from '@shared/utils/logger';
import AdmZip from 'adm-zip';

export async function unzipDirectory(
  inputFilePath: string,
  outputDirectory: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const zip = new AdmZip(inputFilePath);
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
