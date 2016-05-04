module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('+rte-webpackage-upload', 'check crc varsion and upload',
    [ 'check-crc-version:default', '+webpackage-upload' ]);
};

