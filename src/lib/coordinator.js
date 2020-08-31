const libPath = require('path');

const fsExtra = require('fs-extra');

/**
 * @param {AppContainer} app
 * @return {Coordinator}
 */
function createCoordinator(app) {
  const log = app.logger.for('Coordinator');
  return /** @lends Coordinator.prototype */ {
    initialize,
    download,
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
}

module.exports = {
  createCoordinator,
};
