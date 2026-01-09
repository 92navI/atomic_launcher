import * as fs from 'fs';
import * as p from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import * as os from 'os';
import { DownloadProgress } from '@shared/types/ipc-events';

type ProgressCallback = (progress: DownloadProgress) => void;

export async function downloadFile(
  url: string,
  dest: string,
  expectedHash?: string,
  progressCallback?: ProgressCallback
): Promise<string | void> {
  if (fs.existsSync(dest)) {
    if (expectedHash) {
      const fileHash = await getFileHash(dest);
      if (fileHash === expectedHash) return 'File already valid';
    } else {
      return 'File already exists';
    }
  }

  return new Promise((resolve, reject) => {
    fs.mkdirSync(p.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject(
            new Error(
              `Failed to download ${url}: Status ${response.statusCode}`
            )
          );
        }

        const totalSize = parseInt(
          response.headers['content-length'] || '0',
          10
        );
        let downloaded = 0;

        response.on('data', (chunk) => {
          downloaded += chunk.length;
          if (progressCallback) {
            progressCallback({
              stage: 'Downloading Game Files',
              done: downloaded,
              total: totalSize,
            });
          }
        });

        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (err) => {
        file.close(() => fs.unlink(dest, () => reject(err)));
      });
  });
}

function getFileHash(path: string, algorithm = 'sha1'): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export interface DownloadItem {
  url: string;
  dest: string;
  expectedHash?: string;
}

export async function downloadFiles(
  items: DownloadItem[],
  progressCallback?: ProgressCallback
): Promise<void> {
  // Decide concurrency based on CPU cores, capped to something reasonable
  const concurrency = Math.min(os.cpus().length, 8);

  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const { url, dest, expectedHash } = items[i];
      try {
        await downloadFile(url, dest, expectedHash);
        if (progressCallback) {
          progressCallback({
            stage: 'Downloading Game Files',
            done: index,
            total: items.length,
          });
        }
      } catch (err) {
        console.error(`Error downloading ${url}:`, err);
        throw err;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
}
