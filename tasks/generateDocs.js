module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('generateDocs', 'generate documentation', [
    'clean:docs', '_validateSources', 'prepareJsdoc', 'jsdoc', 'deleteGeneretedJsdocConfig'
  ]);
};
