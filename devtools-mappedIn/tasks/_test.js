module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('_test', 'run lints and tests', [
    '_validateSources', 'karma'
  ]);
};
