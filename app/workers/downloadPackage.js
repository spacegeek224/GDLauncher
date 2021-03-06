const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const async = require('async');
const mkdirp = require('mkdirp');
const constants = require('../constants');
const vnlHelpers = require('./common/vanilla');
const downloader = require('./common/downloader');

async function main() {
  // //////////////////
  // //VANILLA STUFF///
  // //////////////////

  const vnlPath = `${constants.LAUNCHER_FOLDER}/${constants.PACKS_FOLDER_NAME}/${process.env.name}`;
  const vnlRead = fs.readFileSync(`${vnlPath}/vnl.json`);
  const vnlJSON = JSON.parse(vnlRead);

  // EXTRACT MC LIBS
  const vnlLibs = vnlHelpers.extractLibs(vnlJSON);

  // EXTRACT MC ASSETS

  const vnlAssets = await vnlHelpers.extractAssets(vnlJSON);

  // EXTRACT MC MAIN JAR

  const mainJar = vnlHelpers.extractMainJar(vnlJSON);

  // ///////////////////
  // //MAIN DOWNLOADER//
  // ///////////////////

  // UPDATES THE TOTAL FILES TO DOWNLOAD
  process.send({ downloaded: 0, total: vnlLibs.length + vnlAssets.length + 1, action: 'UPDATE__TOTAL' });

  await downloader.downloadArr(vnlLibs, process, `${constants.LAUNCHER_FOLDER}/libraries/`);
  // For some urls it will say they are not string-buffer chunks. It's kinda ok I guess
  await downloader.downloadArr(vnlAssets, process, `${constants.LAUNCHER_FOLDER}/assets/`);

  await downloader.downloadArr(mainJar, process, `${constants.LAUNCHER_FOLDER}/versions/`);

  process.send({ action: 'DOWNLOAD__COMPLETED' });
}

// STARTS THE EXECUTION
main();
