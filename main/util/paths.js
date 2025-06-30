const path = require('path');
const os = require('os');

class Paths {
  static BASE_DIR = path.join(os.homedir(), '.atomic');
  static VERSIONS_DIR = path.join(Paths.BASE_DIR, 'versions');
  static NATIVES_DIR = path.join(Paths.BASE_DIR, 'natives');
  static LIB_DIR = path.join(Paths.BASE_DIR, 'libraries');
  static ASSETS_DIR = path.join(Paths.BASE_DIR, 'assets');
  static INSTANCES_DIR = path.join(Paths.BASE_DIR, 'instances');
  static JRE_DIR = path.join(Paths.BASE_DIR, 'jre');
  static TEMP_DIR = path.join(Paths.BASE_DIR, 'temp');
  
  static getJavaPath() {
    return path.join(Paths.JRE_DIR, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  }
  static getVersionPath(version) {
    return path.join(Paths.VERSIONS_DIR, version);
  }
  static getGamePath(instance) {
    return path.join(Paths.INSTANCES_DIR, instance);
  }
  static getNativesPath(version) {
    return path.join(Paths.NATIVES_DIR, version);
  }
}

module.exports = Paths;
