const libPath = require('path');

require('dotenv').config({
  path: libPath.resolve(__dirname, '../.env'),
});

function env(key, defaultValue = undefined) {
  let value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      value = defaultValue;
    } else {
      throw new TypeError(`Enviromental variable ${key} is required`);
    }
  }
  return value;
}

function loadSettings() {
  return /** @lends Settings.prototype */ {
    logLevel: env('LOG_LEVEL', 'info'),
    sourceUrl: env('SOURCE_URL'),
    scratchDir: env('SCRATCH_DIR', libPath.resolve(require('os').tmpdir(), 'onedrive-sucker')),
    targetDir: env('TARGET_DIR'),
  };
}

module.exports = {
  loadSettings,
};
