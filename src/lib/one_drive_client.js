const queryString = require('querystring');
const libPath = require('path');

const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');
const { CookieJar } = require('tough-cookie');
const fsExtra = require('fs-extra');

require('axios-cookiejar-support').default(axios);

/**
 * @param {AppContainer} app
 */
function createOneDriveClient(app) {
  const log = app.logger.for('OneDriveClient');

  return /** @lends {OneDriveClient.prototype} */ {
    downloadFolder,
  };

  /**
   * Download one drive directory from publicly shared URL to a file on HDD
   * NOTE: Only tested with one type of URL, so...
   * @param sourceUrl
   * @param targetPath
   * @param folderName Force a particular name of the wrapper inside the ZIP file
   */
  async function downloadFolder(sourceUrl, targetPath, folderName = 'data') {
    log.info(`Fetching HTML from ${sourceUrl}...`);

    const cookieJar = new CookieJar();

    const resp = await axios.get(sourceUrl, {
      withCredentials: true,
      jar: cookieJar,
    });

    log.info(`Page opened, ${resp.data.length} characters in the HTML`);
    log.verbose(resp.data);

    const mediaBaseUrl = parseValue('.mediaBaseUrl', resp.data);
    log.info(`Media base URL: ${mediaBaseUrl}`);

    const fileUrl = parseValue('CurrentFolderSpItemUrl', resp.data);
    log.info(`File url: ${fileUrl}`);

    const accessToken = parseValue('.driveAccessToken', resp.data);
    log.info(`Access token: ${accessToken}`);

    const downloadUrl = `${mediaBaseUrl}/transform/zip`;
    const docId = fileUrl + '&' + accessToken;
    const downloadRequest = {
      zipFileName: libPath.basename(targetPath),
      guid: uuidv4(),
      provider: 'spo',
      files: JSON.stringify({
        items: [
          {
            name: folderName,
            size: 0,
            docId,
            isFolder: true,
          },
        ],
      }),
    };
    log.info(`Initiating download from ${downloadUrl}, docId: ${docId}`);
    const downloadResponse = await axios.post(downloadUrl, queryString.encode(downloadRequest), {
      withCredentials: true,
      jar: cookieJar,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      responseType: 'stream',
    });

    if (downloadResponse.status >= 400) {
      throw new Error(`Failed to download ${downloadUrl} (code: ${downloadResponse.status})`);
    }

    log.info(`Download started, saving into ${targetPath}...`);

    const writeStream = fsExtra.createWriteStream(targetPath);
    downloadResponse.data.pipe(writeStream);
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    const stats = await fsExtra.stat(targetPath);
    log.info(`Folder downloaded into ${targetPath}: ${Math.floor(stats.size / 1000)}kb`);

    return {
      targetPath,
      fileUrl,
      downloadUrl,
      stats,
    };
  }

  function parseValue(name, data) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`,\\s*"${escapedName}"\\s*:\\s*"([^"]+)"`);
    const match = regex.exec(data);
    if (!match) {
      throw new Error(`Failed to parse "${name}" from downloaded data`);
    }

    const value = JSON.parse(`"${match[1]}"`);
    return value;
  }
}

module.exports = {
  createOneDriveClient,
};
