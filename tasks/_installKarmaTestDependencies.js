'use strict';
var chalk = require('chalk');
var execSync = require('child_process').execSync;
module.exports = function (grunt) {
  grunt.registerTask('_installKarmaTestDependencies', 'Makes some recommended test-frameworks available.',
    function () {
      var dependencies = [
        'karma@^0.12.31',
        'karma-chai@^0.1.0',
        'karma-chrome-launcher@^0.1.7',
        'karma-coverage@^0.2.7',
        'karma-htmlfile-reporter@^0.1.2',
        'karma-junit-reporter@^0.2.2',
        'karma-mocha@^0.1.10',
        'karma-mocha-reporter@^1.0.0',
        'karma-phantomjs-launcher@^0.2.0',
        'karma-sinon@^1.0.4',
        'chai@~3.4.0',
        'mocha@^2.1.0',
        'phantomjs@^1.9.17',
        'sinon@~1.17.2',
        'git+https://pmt.incowia.de/webble/r/client/utilities/cubx-karma-requirejs.git#1.0.5'
      ];
      grunt.log.writeln('\n');
      grunt.log.writeln('Going to install the following (dev-)dependencies:');

      dependencies.forEach(function (dependency) {
        grunt.log.writeln(chalk.grey(' ' + dependency));
      });
      grunt.log.writeln('Start npm install:');
      dependencies.forEach(function (dependency) {
        execSync('npm install ' + dependency + ' --save-dev');
      });
    });
};
