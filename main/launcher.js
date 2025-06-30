const { spawn } = require('child_process');
const path = require('path');
const { ipcMain } = require('electron');
const Paths = require('./util/paths');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const { DateTime } = require('luxon');
const { type } = require('os');
const { log } = require('console');

module.exports = (mainWindow) => {
  ipcMain.handle('launch-game', async () => {
    try {
      const version = '1.20.1-forge-47.4.2';
      await launchGame(version);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
};

async function launchGame(VERSION) {
  // --- CONFIG --- //
  const JAVA_PATH = Paths.getJavaPath();
  const MC_VERSION = '1.20.1';
  const INSTANCE_NAME = 'test';
  const NATIVES_DIR = Paths.getNativesPath('1.20.1');
  const VERSION_DIR = Paths.getVersionPath(VERSION);
  const VERSION_JAR = path.join(VERSION_DIR, `${VERSION}.jar`);
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

  let forgeJson = await loadJson(path.join(VERSION_DIR, `${VERSION}.json`));
  let vanillaJson = await loadJson(path.join(VANILLA_VERSION_DIR, `${MC_VERSION}.json`));

  function buildClasspath(forgeJson, vanillaJson) {
    var classpath = [];
    forgeJson.libraries.forEach(lib => classpath.push(path.join(Paths.LIB_DIR, lib.downloads.artifact.path)));
    vanillaJson.libraries.forEach(lib => classpath.push(path.join(Paths.LIB_DIR, lib.downloads.artifact.path)));
    classpath.push(VERSION_JAR);
    return classpath;
  }

  function buildArgs(forgeJson, vanillaJson, classpath) {
    const sep = process.platform === 'win32' ? ';' : ':';
    const CLASSPATH_STR = classpath.join(sep);

    var javaArgs = [
      `-Xmx${MAX_HEAP}`,
      `-Xms${MIN_HEAP}`,
      // '-Dfml.ignorePatchDiscrepancies=true',
      // '-Dfml.ignoreInvalidMinecraftCertificates=true',
      // `-DlibraryDirectory=${Paths.LIB_DIR}`
    ]

    var gameArgs = [
      forgeJson.mainClass
    ]

    // Push vanilla args
    javaArgs.push(...substituteArray(vanillaJson.arguments.jvm, {
      natives_directory: NATIVES_DIR,
      launcher_name: 'AtomicLauncher',
      launcher_version: '0.0.1',
      classpath: CLASSPATH_STR
    }));
    const logConfig = vanillaJson.logging.client;
    const logConfigDir = path.join(Paths.ASSETS_DIR, 'log_configs', logConfig.file.id);
    javaArgs.push(substitute(logConfig.argument, { path: logConfigDir }))
    gameArgs.push(...substituteArray(vanillaJson.arguments.game, {
      auth_player_name: username,
      version_name: VERSION,
      game_directory: GAME_DIR,
      assets_root: Paths.ASSETS_DIR,
      assets_index_name: '5',
      auth_uuid: uuid,
      auth_access_token: accessToken,
      clientid: clientId,
      auth_xuid: xuid,
      user_type: 'msa',
      version_type: 'release'
    }));

    // Push foge args
    gameArgs.push(...forgeJson.arguments.game);
    javaArgs.push(...substituteArray(forgeJson.arguments.jvm, {
      library_directory: Paths.LIB_DIR,
      classpath_separator: sep,
      version_name: MC_VERSION
    })
    );

    return javaArgs.concat(gameArgs);
  }

  // --- Build & launch --- //
  const classpath = buildClasspath(forgeJson, vanillaJson);
  const args = buildArgs(forgeJson, vanillaJson, classpath);

  console.log('\n=== Launching Minecraft ===\n');

  var mcProcess = spawn(JAVA_PATH, args, {
    cwd: GAME_DIR,
  });

  console.log(`Minecraft launched with PID: ${mcProcess.pid}`);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true
  });

  mcProcess.stdout.on('data', (data) => processLog(data, parser));

  mcProcess.on('close', (code) => {
    console.log(`\nMinecraft exited with code ${code}`);
  });
  mcProcess.on('error', (err) => {
    console.error('Minecraft execution failed:', err);
  });
}

async function loadJson(jsonPath) {
  try {
    const data = await fs.promises.readFile(jsonPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load or parse JSON:', err);
    return undefined;
  }
}

function substituteArray(args, params) {
  return args.flatMap((arg) => {
    if (typeof arg !== 'string') return [];
    return [substitute(arg, params)];
  });
}

function substitute(str, params) {
  return str.replace(/\${(\w+)\}/g, (match, key) => {
    if (key in params) {
      return params[key];
    }
    return match;
  });
}

function formatTimestamp(ms) {
  return DateTime.fromMillis(Number(ms)).toFormat('HH:mm:ss');
}

function processLog(data, parser) {
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
  console.log(`${color}[${formatTimestamp(event.timestamp)}] [${event.thread} ${event.level}]: ${event.Message}`);
}