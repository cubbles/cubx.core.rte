'use strict';
var chalk = require('chalk');
module.exports = function (grunt) {
  grunt.registerTask('initGitInfo', 'Explains how to setup a git repo for this webpackage.', function () {
    grunt.log.writeln('\n' +
      'We don`t find it useful to automate this for you - but here is what you need to do:');
    grunt.log.writeln(chalk.green('$ git init') +
      ' //use \'--template <path>\' to use a git template of your choice');
    grunt.log.writeln(chalk.green('$ git remote set-url origin <url>') +
      ' //e.g. with url=https://pmt.incowia.de/webble/r/~<username>/webpackages/' +
      grunt.config.get('manifestWebpackage.name') + '.git');
  });
};
