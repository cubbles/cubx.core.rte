'use strict';

module.exports.tasks = {
  copy: {
    // Copies all files into build directory for vulcanization

    static: {
      files: [
        {
          /* copy manifests */
          expand: false,
          src: '<%= param.src %>/manifest.webapp',
          dest: '<%= param.dst %>/manifest.webapp'
        },
        {
          /* copy manifests */
          expand: false,
          src: '<%= param.src %>/manifest.component',
          dest: '<%= param.dst %>/manifest.component'
        },
        {
          /* copy manifests */
          expand: false,
          src: '<%= param.src %>/manifest.webpackage',
          dest: '<%= param.dst %>/manifest.webpackage'
        },
        /* copy manifests */
        {
          expand: false,
          src: '<%= param.src %>/manifest.cubx',
          dest: '<%= param.dst %>/manifest.cubx'
        },
        {
          /* copy main.js files */
          expand: true,
          cwd: '<%= param.src %>/',
          src: 'js/main.js',
          dest: '<%= param.dst %>/'
        },
        {
          /* copy icons */
          expand: true,
          cwd: '<%= param.src %>/',
          src: 'style/icons/**/*',
          dest: '<%= param.dst %>/'
        },
        {
          /* copy images */
          expand: true,
          cwd: '<%= param.src %>/',
          src: 'style/images/**/*',
          dest: '<%= param.dst %>/'
        },
        {
          /* copy fonts */
          expand: true,
          cwd: '<%= param.src %>/',
          src: 'style/fonts/**/*',
          dest: '<%= param.dst %>/'
        },
        {
          /* copy locales */
          expand: true,
          cwd: '<%= param.src %>/',
          src: 'locales/**/*',
          dest: '<%= param.dst %>/'
        },
        {
          /* copy json files */
          expand: true,
          cwd: '<%= param.src %>/',
          src: [ '**/*.json', '!**/bower.json', '!**/package.json' ],
          dest: '<%= param.dst %>/'
        } ]
    }

  },
  clean: {
    dist: [
      '<%= param.dst %>/', '<%= param.tmp %>/',
      '<%= param.build %>/', '<%= param.pack %>/' ],
    docs: [ '<%= param.doc %>/' ],
    tests: [ '<%= param.dst %>/test' ]
  },
  githooks: {
    all: {
      options: {
        dest: '../.git/hooks'
      },
      'pre-commit': '_validateSources'
    }
  },
  'json-replace': {
    'manifest.webapp': {
      options: {
        replace: {
          name: '<%= param.name %>',
          version: '<%= param.version %>',
          description: '<%= param.description %>'
        }
      },
      files: [
        {
          src: '<%= param.build %>/manifest.webapp',
          dest: '<%= param.dst %>/manifest.webapp'
        } ]
    }
  },
  'package-param': {
    file: '<%= param.build %>/manifest.webpackage'
  }
};
