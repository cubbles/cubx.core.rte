module.exports = function (grunt) {
  'use strict';
  grunt.registerTask('+startWebserver', 'Run a http-Server to get http access to your project files and data.', [
    'cubx-http-server:dev'
  ]);
};
