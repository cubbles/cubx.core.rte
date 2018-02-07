/**
 * Created by Edwin Gamboa on 25/05/2017.
 */
module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('+webpackage-release', 'Release a webpackage.', [
    '_webpackage-prepareRelease', '+webpackage-upload', '_webpackage-updateToNextVersion'
  ]);
};
