'use strict';
module.exports.tasks = {

  'check-crc-version': {
    default: {
      manifestFile: '<%= param.src %>/manifest.webpackage',
      crcFile: '<%= param.src %>/crc/modules/crc/CRC.js'
    }
  }

};
