'use strict';

module.exports.tasks = {
  eslint: {
    utils: {
      options: {
        configFile: '.eslintrc'
      },
      src: [
        '*.js',
        'tasks/**/*.js',
        'lib/**/*.js'
      ]
    },
    client: {
      options: {
        configFile: '<%= param.src %>/.eslintrc'
      },
      src: [
        '<%= param.src %>/**/*.js',
        '!<%= param.src %>/**/vendor/**',
        '!<%= param.src %>/**/es6-promise-polyfill.js',
        '!<%= param.src %>/**/test-results/**',
        '!<%= param.src %>/**/bower_components/**',
        '!<%= param.src %>/**/jquery-1.11.1.min.js',
        '!<%= param.src %>/**/text/*.js',
        '!<%= param.src %>/webcomponents/*.js',
        '!<%= param.src %>/**/bower_components/**'
      ]
    }
  },
  jsonlint: {
    files: {
      src: [
        '<%= param.src %>/manifest.webpackage',
        '<%= param.src %>/**/*.json'
      ]
    }
  },
  csslint: {
    options: {
      csslintrc: '.csslintrc'
    },
    strict: { // attach exclude file with prefix '!', ex: ![path]/main.css
      src: [ '<%= param.src %>/**/*.css', '!<%= param.src %>/**/vendor/**', '!<%= param.src %>/**/test-results/**' ]
    }
  }

};
