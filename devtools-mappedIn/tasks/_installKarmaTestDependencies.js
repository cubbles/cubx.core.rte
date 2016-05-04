'use strict';
var chalk = require('chalk');
var execSync = require('child_process').execSync;
module.exports = function (grunt) {
  grunt.registerTask('_installKarmaTestDependencies', 'Makes some recommended test-frameworks available.',
    function () {
      var dependencies = [
        'grunt-karma@^0.12.2',
        'karma@^0.13.22',
        'karma-sinon-chai@^1.2.0',
        'karma-chrome-launcher@^0.2.3',
        'karma-coverage@^0.5.5',
        'karma-htmlfile-reporter@^0.2.2',
        'karma-junit-reporter@^0.2.2',
        'karma-mocha@^0.2.2',
        'karma-mocha-reporter@^2.0.1',
        'mocha@^2.4.5',
        'sinon-chai@~1.17.2',
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
