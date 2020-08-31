const { MayanLogger } = require('mayan-logger');

const { createOneDriveClient } = require('./lib/one_drive_client');
const { createUpdater } = require('./lib/updater');
const { createUnpacker } = require('./lib/unpacker');

class AppContainer {
  /**
   * @param {Settings} settings
   */
  constructor(settings) {
    this.settings = settings;

    this.logger = new MayanLogger({
      level: settings.logLevel,
    });

    this.log = this.logger.log;

    /** @type {OneDriveClient} */
    this.oneDriveClient = createOneDriveClient(this);

    /** @type {Unpacker} */
    this.unpacker = createUnpacker(this);

    /** @type {Updater} */
    this.updater = createUpdater(this);
  }

  async initialize() {
    await this.updater.initialize();
  }
}

module.exports = {
  AppContainer,
};
