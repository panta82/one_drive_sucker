const { MayanLogger } = require('mayan-logger');

const { createOneDriveClient } = require('./lib/one_drive_client');
const { createUpdater } = require('./lib/updater');

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
