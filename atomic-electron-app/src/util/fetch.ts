import * as fs from 'fs';
import * as p from 'path';
import * as https from 'https';
import * as crypto from 'crypto';

type ProgressCallback = (progress: {
  stage: string;
  filename: string;
  done: number;
  total: number;
}) => void;

export async function downloadFile(
  url: string,
  dest: string,
  expectedHash: string | null = null,
  progressCallback: ProgressCallback | null = null
): Promise<string | void> {
  if (fs.existsSync(dest)) {
    if (expectedHash) {
      // const fileHash = crypto
      //   .createHash('sha1')
      //   .update(fs.readFileSync(dest))
      //   .digest('hex');
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
        if (response.statusCode !== 200)
          return reject(
            `Failed to download ${url}: Status ${response.statusCode}`
          );

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
              filename: p.basename(dest),
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

function getFileHash(path: string, algorithm = 'sha1') {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
