import { spawn } from 'child_process';
import * as p from 'path';
import { ipcMain } from 'electron';
import Paths from './util/paths.js';
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { DateTime } from 'luxon';
import logger from '@shared/utils/logger.js';
import { ForgeJson, Library, VanillaJson } from '@shared/types/json-schemas.js';
import tryInstallLatest from './managers/profile-manager.js';

export default function initLauncher() {
  ipcMain.on('play', async () => {
    try {
      const profile = 'imperial';
      await tryInstallLatest(profile);
      await launchGame(profile);
      return { success: true };
    } catch (err: unknown) {
      logger.error(err);
      if (err instanceof Error) return { success: false, error: err.message };
    }
  });
}

async function launchGame(profile: string, profileVersion?: string) {
  // --- CONFIG --- //
  const JAVA_PATH: string = Paths.getJavaPath();
  const MC_VERSION = '1.20.1';
  // const VERSION = '1.20.1-forge-47.4.2';
  const VERSION = '1.20.1';
  const INSTANCE_NAME =
    profile + (profileVersion ? `@${profileVersion}` : '@latest');
  const NATIVES_DIR = Paths.getNativesPath(MC_VERSION);
  const VERSION_DIR = Paths.getVersionPath(VERSION);
  const VERSION_JAR = p.join(VERSION_DIR, `${VERSION}.jar`);
  const VANILLA_VERSION_DIR = Paths.getVersionPath(MC_VERSION);
  const GAME_DIR = Paths.getGamePath(INSTANCE_NAME);
  const MAX_HEAP = '4096m';
  const MIN_HEAP = '256m';

  fs.mkdirSync(GAME_DIR, { recursive: true });

  // --- Placeholder user info --- //
  const username = '_92navI_';
  const uuid = '24424be8f0614e3ca1ad55e09e3d72c2';
  const accessToken = 'YOUR_ACCESS_TOKEN';
  const xuid = '2535443780439106';
  const clientId = 'your-client-id';

  // const forgeJson = await loadJson(p.join(VERSION_DIR, `${VERSION}.json`));
  const forgeJson = undefined;
  const vanillaJson = await loadJson(
    p.join(VANILLA_VERSION_DIR, `${MC_VERSION}.json`)
  );

  function buildClasspath(vanillaJson: VanillaJson, forgeJson?: ForgeJson) {
    const classpath = [];
    vanillaJson.libraries.forEach((lib: Library) =>
      classpath.push(p.join(Paths.LIB_DIR, lib.downloads.artifact.path))
    );
    if (forgeJson) {
      forgeJson.libraries.forEach((lib: Library) =>
        classpath.push(p.join(Paths.LIB_DIR, lib.downloads.artifact.path))
      );
    }
    classpath.push(VERSION_JAR);
    return classpath;
  }

  function buildArgs(
    classpath: Array<string>,
    vanillaJson: VanillaJson,
    forgeJson?: ForgeJson
  ) {
    const sep = process.platform === 'win32' ? ';' : ':';
    const CLASSPATH_STR = classpath.join(sep);

    const javaArgs = [`-Xmx${MAX_HEAP}`, `-Xms${MIN_HEAP}`];

    const gameArgs = [forgeJson ? forgeJson.mainClass : vanillaJson.mainClass];

    // Push vanilla args
    javaArgs.push(
      ...substituteArray(
        vanillaJson.arguments.jvm.filter((a) => typeof a === 'string'),
        {
          natives_directory: NATIVES_DIR,
          launcher_name: 'AtomicLauncher',
          launcher_version: '0.0.1',
          classpath: CLASSPATH_STR,
        }
      )
    );
    const logConfig = vanillaJson.logging.client;
    if (logConfig) {
      const logConfigDir = p.join(
        Paths.ASSETS_DIR,
        'log_configs',
        logConfig.file.id
      );
      javaArgs.push(substitute(logConfig.argument, { path: logConfigDir }));
    }
    gameArgs.push(
      ...substituteArray(
        vanillaJson.arguments.game.filter((a) => typeof a === 'string'),
        {
          auth_player_name: username,
          version_name: VERSION,
          game_directory: GAME_DIR,
          assets_root: Paths.ASSETS_DIR,
          assets_index_name: vanillaJson.assetIndex.id,
          auth_uuid: uuid,
          auth_access_token: accessToken,
          clientid: clientId,
          auth_xuid: xuid,
          user_type: 'msa',
          version_type: vanillaJson.type,
        }
      )
    );

    // Push foge args
    if (forgeJson) {
      gameArgs.push(
        ...forgeJson.arguments.game.filter((a) => typeof a === 'string')
      );
      javaArgs.push(
        ...substituteArray(
          forgeJson.arguments.jvm.filter((a) => typeof a === 'string'),
          {
            library_directory: Paths.LIB_DIR,
            classpath_separator: sep,
            version_name: MC_VERSION,
          }
        )
      );
    }

    return javaArgs.concat(gameArgs);
  }

  // --- Build & launch --- //
  const classpath = buildClasspath(vanillaJson, forgeJson);
  const args = buildArgs(classpath, vanillaJson, forgeJson);

  console.log('\n=== Launching Minecraft ===\n');

  const mcProcess = spawn(JAVA_PATH, args, {
    cwd: GAME_DIR,
  });

  console.log(`Minecraft launched with PID: ${mcProcess.pid}`);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcProcess.stdout.on('data', (data: any) => processLog(data, parser));

  mcProcess.on('close', (code: number) => {
    console.log(`\nMinecraft exited with code ${code}`);
  });
  mcProcess.on('error', (err: Error) => {
    console.error('Minecraft execution failed:', err);
  });
}

async function loadJson(jsonPath: string) {
  try {
    const data = await fs.promises.readFile(jsonPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load or parse JSON:', err);
    return undefined;
  }
}

function substituteArray(
  args: Array<string>,
  params: { [key: string]: string }
) {
  return args.flatMap((arg) => {
    if (typeof arg !== 'string') return [];
    return [substitute(arg, params)];
  });
}

function substitute(str: string, params: { [key: string]: string }) {
  return str.replace(/\${(\w+)\}/g, (match, key) => {
    if (
      Object.prototype.hasOwnProperty.call(params, key) &&
      params[key] !== undefined &&
      params[key] !== null
    ) {
      return String(params[key]);
    }
    return match;
  });
}

function formatTimestamp(ms: number) {
  return DateTime.fromMillis(Number(ms)).toFormat('HH:mm:ss');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processLog(data: any, parser: XMLParser) {
  const parsed = parser.parse(data.toString());
  const event = parsed.Event;
  if (!event.Message) return;
  let color;
  switch (event.level) {
    case 'DEBUG':
    case 'INFO':
      color = '\x1b[37m';
      break;
    case 'WARN':
      color = '\x1b[33m';
      break;
    case 'ERROR':
      color = '\x1b[31m';
      break;
    default:
      break;
  }
  console.log(
    `${color}[${formatTimestamp(event.timestamp)}] [${event.thread} ${event.level}]: ${event.Message}`
  );
}
