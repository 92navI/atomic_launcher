const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

function downloadFile(url, dest, expectedHash = null, progressCallback = null) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      if (expectedHash) {
        const fileHash = crypto.createHash('sha1').update(fs.readFileSync(dest)).digest('hex');
        if (fileHash === expectedHash) return resolve('File already valid');
      } else {
        return resolve('File already exists');
      }
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode !== 200) return reject(`Failed to download ${url}: Status ${response.statusCode}`);

      const totalSize = parseInt(response.headers['content-length'], 10);
      var downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;

        if (progressCallback) {

          progressCallback({
            stage: 'Downloading Game Files',
            filename: path.basename(dest),
            done: downloaded,
            total: totalSize
          });
        }
      });

      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

module.exports = { downloadFile };
