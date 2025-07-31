import * as p from 'path';
import * as os from 'os';

export default class Paths {
  static BASE_DIR = p.join(os.homedir(), '.atomic');
  static VERSIONS_DIR = p.join(Paths.BASE_DIR, 'versions');
  static NATIVES_DIR = p.join(Paths.BASE_DIR, 'natives');
  static LIB_DIR = p.join(Paths.BASE_DIR, 'libraries');
  static ASSETS_DIR = p.join(Paths.BASE_DIR, 'assets');
  static INSTANCES_DIR = p.join(Paths.BASE_DIR, 'profiles');
  static JRE_DIR = p.join(Paths.BASE_DIR, 'jre');
  static TEMP_DIR = p.join(Paths.BASE_DIR, 'temp');

  static getJavaPath(): string {
    return p.join(
      Paths.JRE_DIR,
      'bin',
      process.platform === 'win32' ? 'java.exe' : 'java'
    );
  }
  static getVersionPath(version: string): string {
    return p.join(Paths.VERSIONS_DIR, version);
  }
  static getGamePath(instance: string): string {
    return p.join(Paths.INSTANCES_DIR, instance);
  }
  static getNativesPath(version: string): string {
    return p.join(Paths.NATIVES_DIR, version);
  }
}
