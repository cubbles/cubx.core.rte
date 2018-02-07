/* globals module,require */
module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('+webpackage-validateManifestFile', 'Validate \'manifest.webpackage\' file.', function () {
    var WebpackageDocument = require('cubx-webpackage-document-api/lib/WebPackageDocument');
    var doc = new WebpackageDocument(grunt.config.get('manifestWebpackage'));
    //
    var onSuccess = function () {
      //
    };
    var onUnsupportedModelVersionError = function (error) {
      grunt.fail.fatal(error);
    };
    var onValidationError = function (errors) {
      errors.forEach(function (error) {
        if (error.dataPath && error.message) {
          // schema validation failed
          grunt.log.writeln('Validation Error: ' + error.dataPath + ' >>> ' + error.message);
        } else {
          // rule violation
          grunt.log.writeln(error);
        }
      });
      grunt.fail.fatal('Validation failed.');
    };
    doc.validate(onSuccess, onUnsupportedModelVersionError, onValidationError);
  });
};
