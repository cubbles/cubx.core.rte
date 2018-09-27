// Karma configuration
// Generated on Fri Jun 20 2014 14:13:49 GMT+0800 (CST)

module.exports = function (config) {
  'use strict';
  var configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [ 'mocha', 'sinon-chai' ],

    // list of files / patterns to load in the browser
    files: [
      'test/mocha-config.js',
      'js/template-utils.js',
      {pattern: 'test/resources/*.html', included: false, served: true},
      'test/unit/**/*_test.js'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'template-utils.js': [ 'coverage' ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'progress', 'junit', 'html', 'mocha', 'coverage' ],
    // reporters: ['progress'],
    junitReporter: {
      outputDir: 'test-results/surefire-reports',
      outputFile: 'TEST-karma.xml'
    },

    htmlReporter: {
      outputFile: 'test-results/html/TEST-karma.html'
    },

    mochaReporter: {
      output: 'autowatch'
    },

    coverageReporter: {
      type: 'html',
      dir: 'test-results/coverage/'
    },
    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO ||
    // config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['PhantomJS'], //, 'Firefox', 'Chrome'

    // browsers: [ 'Chrome', 'Firefox' ],
    // use just Chrome for debugging in Webstorm
    browsers: [ 'Chrome' ],
    captureTimeout: 10000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: [ '--no-sandbox' ]
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = [ 'Chrome_travis_ci', 'Firefox' ];
  }

  config.set(configuration);
};
