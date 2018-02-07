module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('_validateSources', 'validate js and css', [
    'eslint', 'jsonlint', 'csslint'
  ]);
};
