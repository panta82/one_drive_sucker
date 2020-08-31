const libPath = require('path');

const extractZip = require('extract-zip');
const { v4: uuidv4 } = require('uuid');
const fsExtra = require('fs-extra');

/**
 * @param {AppContainer} app
 * @return {Unpacker}
 */
function createUnpacker(app) {
  const log = app.logger.for('Unpacker');
  return /** @lends Unpacker.prototype */ {
    unpack,
  };

  async function unwrapDirectory(path) {
    const log = app.logger.for('Unpacker', 'unwrap directory');

    const listing = await fsExtra.readdir(path);
    if (!listing || listing.length !== 1) {
      // Nothing to do
      return false;
    }

    // Rename parent, so that we are reasonably safe
    const tmpPath = path + '__' + uuidv4();
    log.verbose(`Unwrapping ${path} using temp path ${tmpPath}`);
    await fsExtra.move(path, tmpPath);

    const childPath = libPath.resolve(tmpPath, listing[0]);
    const childListing = await fsExtra.readdir(childPath);

    await Promise.all(
      childListing.map(childName => {
        const from = libPath.resolve(childPath, childName);
        const to = libPath.resolve(path, childName);
        log.verbose(`${from} -> ${to}`);
        return fsExtra.move(from, to, {
          overwrite: true,
        });
      })
    );

    log.verbose(`Cleaning up ${tmpPath}...`);
    await fsExtra.remove(tmpPath);

    return true;
  }

  /**
   * @param zipFile
   * @param targetDirectory
   * @param unwrap If true, we will remove wrapping directory if we find it
   * @return {Promise<void>}
   */
  async function unpack(zipFile, targetDirectory, unwrap = false) {
    log.info(`Emptying ${targetDirectory}...`);
    await fsExtra.emptyDir(targetDirectory);

    log.info(`Unpacking ${zipFile}...`);
    await extractZip(zipFile, {
      dir: targetDirectory,
      onEntry: entry => {
        log.verbose(`Extracting "${entry.fileName}"...`);
      },
    });

    let unwrapped = false;
    if (unwrap) {
      log.info(`Unwrapping...`);
      unwrapped = await unwrapDirectory(targetDirectory);
    }

    log.info(`${zipFile} unpacked into ${targetDirectory}${unwrapped ? ' and unwrapped' : ''}`);

    return {
      zipFile,
      targetDirectory,
      unwrapped,
    };
  }
}

module.exports = {
  createUnpacker,
};
