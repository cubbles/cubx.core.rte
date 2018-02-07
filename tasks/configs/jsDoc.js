'use strict';

module.exports.tasks = {
  jsdoc: {
    src: [
      '<%= param.src %>/**/*.js', '<%= param.src %>/README.md',
      '!<%= param.src %>/**/vendor/**',
      '!<%= param.src %>/**/test/**',
      '!<%= param.src %>/**/test-results/**',
      '!<%= param.src %>/**/jquery-1.11.1.min.js',
      '!<%= param.src %>/**/text/*.js' ],
    options: {
      destination: '<%= param.doc %>',
      template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
      configure: '<%= param.src %>/jsdoc-config.json'
    }
  }
};
