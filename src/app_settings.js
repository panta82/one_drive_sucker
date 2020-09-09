const libPath = require('path');

require('dotenv').config({
  path: libPath.resolve(__dirname, '../.env'),
});

const ENVS = {
  LOG_LEVEL: 'LOG_LEVEL',
  SOURCE_URL: 'SOURCE_URL',
  SCRATCH_DIR: 'SCRATCH_DIR',
  TARGET_DIR: 'TARGET_DIR',
  REPLACE_TARGET: 'REPLACE_TARGET',
  CRON: 'CRON',
};

function loadSettings(overrides = {}) {
  return /** @lends AppSettings.prototype */ {
    logLevel: env(ENVS.LOG_LEVEL, 'info'),
    sourceUrl: env(ENVS.SOURCE_URL),
    scratchDir: env(ENVS.SCRATCH_DIR, libPath.resolve(require('os').tmpdir(), 'one_drive_sucker')),
    targetDir: env(ENVS.TARGET_DIR),
    replaceTarget: asBoolean(env(ENVS.REPLACE_TARGET, 'false')),
    cron: env(ENVS.CRON, '0 6 * * *'), // Default: 6AM
  };

  function env(key, defaultValue = undefined) {
    let value = overrides[key];
    if (value !== undefined) {
      return value;
    }

    value = process.env[key];
    if (value !== undefined) {
      return value;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new TypeError(`Environmental variable ${key} is required`);
  }

  function asBoolean(str) {
    str = String(str).toLowerCase();
    return !!(str && str !== 'false');
  }
}

module.exports = {
  ENVS,

  loadSettings,
};
