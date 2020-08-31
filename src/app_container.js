const { MayanLogger } = require('mayan-logger');

const { createOneDriveClient } = require('./lib/one_drive_client');
const { createCoordinator } = require('./lib/coordinator');
const { createUnpacker } = require('./lib/unpacker');

class AppContainer {
  /**
   * @param {AppSettings} settings
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

    /** @type {Coordinator} */
    this.coordinator = createCoordinator(this);
  }

  async initialize() {
    await this.coordinator.initialize();
  }
}

module.exports = {
  AppContainer,
};
