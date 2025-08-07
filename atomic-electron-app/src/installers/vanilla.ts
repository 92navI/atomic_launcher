import * as fs from 'fs';
import * as p from 'path';
import axios from 'axios';
import AdmZip from 'adm-zip';
import Paths from '../util/paths.js';
import { downloadFile } from '../util/fetch.js';
import {
  AssetIndexJsonSchema,
  Rule,
  VanillaJson,
  VanillaJsonSchema,
  Version,
  VersionConfigSchema,
  VersionManifestSchema,
  type VersionManifest,
} from '@shared/types/json-schemas.js';
import { DownloadProgress } from '@shared/types/ipc-events.js';
import { loadJson, writeJson } from '../util/json.js';
import logger from '@shared/utils/logger.js';

export default async function tryInstallVersion(
  version: string,
  handleProgress: (_progress: DownloadProgress) => void
): Promise<void> {
  const versionListPath = p.join(Paths.VERSIONS_DIR, 'versions.json');
  const versionList = await loadJson(versionListPath, VersionConfigSchema);
  if (versionList.includes(version)) {
    logger.info(`Version ${version} already installed.`);
    return;
  }

  const NATIVE_DIR = Paths.getNativesPath(version);

  const manifestURL: string =
    'https://launchermeta.mojang.com/mc/game/version_manifest.json';
  const { data: rawManifest } = await axios.get(manifestURL);
  const manifest: VersionManifest = VersionManifestSchema.parse(rawManifest);

  const versionMeta = manifest.versions.find((v: Version) => v.id === version);
  if (!versionMeta) throw new Error(`Base version ${version} not found`);

  const { data: rawVersionJson } = await axios.get(versionMeta.url);
  // console.log(rawVersionJson);
  const result = VanillaJsonSchema.safeParse(rawVersionJson);
  let versionJson: VanillaJson;
  if (!result.success) {
    throw result.error;
  } else {
    versionJson = result.data;
  }

  const versionPath = Paths.getVersionPath(version);
  fs.mkdirSync(versionPath, { recursive: true });

  fs.writeFileSync(
    p.join(versionPath, `${version}.json`),
    JSON.stringify(versionJson, null, 2)
  );
  await downloadFile(
    versionJson.downloads.client.url,
    p.join(versionPath, `${version}.jar`),
    versionJson.downloads.client.sha1,
    handleProgress
  );

  // Download libraries
  const osKey = getOSNativeKey();
  for (const [index, lib] of versionJson.libraries.entries()) {
    const allow = !lib.rules || allowLibrary(lib.rules);
    if (!allow) continue;

    const artifact = lib.downloads?.artifact;

    if (artifact) {
      const libPath = p.join(Paths.LIB_DIR, artifact.path);
      fs.mkdirSync(p.dirname(libPath), { recursive: true });
      await downloadFile(artifact.url, libPath, artifact.sha1);
      handleProgress({
        stage: 'Downloading Libraries',
        filename: lib.name,
        done: index,
        total: versionJson.libraries.length,
      });

      // Handle natives
      if (lib.name.includes(osKey) && lib.name.includes('natives')) {
        const jarPath = p.join(Paths.TEMP_DIR, artifact.path);
        await downloadFile(artifact.url, jarPath, artifact.sha1);
        handleProgress({
          stage: 'Downloading Libraries',
          filename: lib.name,
          done: index,
          total: versionJson.libraries.length,
        });

        fs.mkdirSync(p.dirname(NATIVE_DIR), { recursive: true });
        const zip = new AdmZip(jarPath);
        zip.getEntries().forEach((entry) => {
          if (!entry.isDirectory && /\.(dll|so|dylib)$/.test(entry.entryName)) {
            zip.extractEntryTo(entry, NATIVE_DIR, false, true);
          }
        });
      }
    }
  }

  const logConfigFile = versionJson.logging.client?.file;
  if (logConfigFile) {
    const logConfigDir = p.join(
      Paths.ASSETS_DIR,
      'log_configs',
      logConfigFile.id
    );
    await downloadFile(logConfigFile.url, logConfigDir, logConfigFile.sha1);
    handleProgress({
      stage: 'Downloading Log Config',
      filename: logConfigFile.id,
      done: 1,
      total: 1,
    });
  }

  // Download Assets
  const assetIndexUrl = versionJson.assetIndex.url;
  const assetIndexId = versionJson.assetIndex.id;
  const { data: rawAssetIndex } = await axios.get(assetIndexUrl);
  const assetIndex = AssetIndexJsonSchema.parse(rawAssetIndex);

  // Save asset index
  const indexPath = p.join(Paths.ASSETS_DIR, 'indexes', `${assetIndexId}.json`);
  fs.mkdirSync(p.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify(assetIndex, null, 2));

  // Iterate through assets
  const assetObjects = assetIndex.objects;
  for (const [index, [name, obj]] of Object.entries(assetObjects).entries()) {
    const hash = obj.hash;
    const subDir = hash.substring(0, 2);
    const url = `https://resources.download.minecraft.net/${subDir}/${hash}`;
    const assetPath = p.join(Paths.ASSETS_DIR, 'objects', subDir, hash);
    fs.mkdirSync(p.dirname(assetPath), { recursive: true });
    await downloadFile(url, assetPath, hash);
    handleProgress({
      stage: 'Downloading Assets',
      filename: name,
      done: index,
      total: Object.keys(assetObjects).length,
    });
  }

  versionList.push(version);
  writeJson(versionListPath, versionList);
  console.log(`Vanilla ${version} installation complete!`);
}

function allowLibrary(rules: Rule[]): boolean {
  for (const rule of rules) {
    if (
      rule.action === 'allow' &&
      (!rule.os || rule.os.name === process.platform)
    )
      return true;
    if (rule.action === 'disallow' && rule.os?.name === process.platform)
      return false;
  }
  return true;
}

function getOSNativeKey(): string {
  if (process.platform === 'win32') return 'windows';
  if (process.platform === 'darwin') return 'macos';
  return 'linux';
}
