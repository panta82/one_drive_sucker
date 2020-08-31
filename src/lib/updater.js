const libPath = require('path');

const fsExtra = require('fs-extra');

/**
 * @param {AppContainer} app
 * @return {Updater}
 */
function createUpdater(app) {
  const log = app.logger.for('Updater');
  return /** @lends Updater.prototype */ {
    initialize,
    update,
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
   * Update the target directory and emit notifications, if needed
   */
  async function update() {
    log.info(`Downloading the drive...`);

    const downloadResult = await app.oneDriveClient.downloadFolder(
      app.settings.sourceUrl,
      libPath.resolve(app.settings.scratchDir, 'sucked.zip')
    );

    log.info(`TODO...`, downloadResult);
  }
}

module.exports = {
  createUpdater,
};
