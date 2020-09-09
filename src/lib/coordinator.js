const libPath = require('path');

const fsExtra = require('fs-extra');
const nodeCron = require('node-cron');

/**
 * @param {AppContainer} app
 * @return {Coordinator}
 */
function createCoordinator(app) {
  const log = app.logger.for('Coordinator');

  /** @type {ScheduledTask} */
  let _cronTask;
  let _cronRunning;

  return /** @lends Coordinator.prototype */ {
    initialize,
    download,
    startDaemon,
    stopDaemon,
  };

  async function initialize() {
    if (libPath.resolve(app.settings.targetDir) === libPath.resolve(app.settings.scratchDir)) {
      throw new Error(`Your scratch and target dir shouldn't be the same`);
    }

    log.info(`Preparing target location at ${app.settings.targetDir}...`);
    await fsExtra.ensureDir(libPath.resolve(app.settings.targetDir));

    log.info(`Preparing scratch dir at ${app.settings.scratchDir}...`);
    await fsExtra.emptyDir(libPath.resolve(app.settings.scratchDir));
  }

  /**
   * Download the configured remote one-drive into the target directory
   */
  async function download() {
    log.info(`Downloading the drive...`);

    const downloadResult = await app.oneDriveClient.downloadFolder(
      app.settings.sourceUrl,
      libPath.resolve(app.settings.scratchDir, 'sucked.zip')
    );

    log.info(`Unpacking...`);
    const unpackResult = await app.unpacker.unpack(
      downloadResult.targetPath,
      libPath.resolve(app.settings.scratchDir, 'unpacked'),
      true
    );

    log.info(`Saving...`);
    await fsExtra.remove(app.settings.targetDir);
    await fsExtra.move(unpackResult.destinationDir, app.settings.targetDir);

    log.info(`Done. Files are available at ${app.settings.targetDir}`);
  }

  /**
   * Start background update process.
   */
  function startDaemon() {
    stopDaemon();
    _cronTask = nodeCron.schedule(app.settings.cron, executeCron);
    log.info(`Download daemon started based on cron "${app.settings.cron}"`);
  }

  /**
   * Method that actually executes scheduled task.
   * NOTE calls of this method might overlap, depending on how long they take
   * @return {Promise<void>}
   */
  async function executeCron() {
    if (_cronRunning) {
      log.warn(`Scheduled download was triggered while previous download hasn't completed yet!`);
      return;
    }

    try {
      _cronRunning = true;
      await download();
    } catch (err) {
      log.error(`Scheduled download has failed`, err);
    } finally {
      _cronRunning = false;
    }
  }

  /**
   * Stop cron, if one is running. Returns true if cron was stopped.
   */
  function stopDaemon() {
    if (!_cronTask) {
      return false;
    }

    _cronTask.stop();
    _cronTask = null;
    log.info(`Cron stopped`);
    return true;
  }
}

module.exports = {
  createCoordinator,
};
