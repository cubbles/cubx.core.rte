'use strict';

var _ = require('lodash');
var chalk = require('chalk');

module.exports = function (grunt) {
  grunt.registerTask('default', [], function () {
    require('../lib/cubbles.js')(grunt);
    /**
     * Show Top-Level Cubbles-Tasks.
     */
    grunt.log.writeln('\n' + chalk.underline.bold('Available Cubbles-Tasks:'));
    var tasks = grunt.task._tasks;
    var cubxTasks = [];
    Object.keys(tasks).forEach(function (tasksName) {
      if (tasksName.match(/^[+_]+(.)*/)) {
        cubxTasks.push({
          name: tasksName,
          info: tasks[ tasksName ].info
        });
      }
    });
    cubxTasks = _.sortBy(cubxTasks, 'name');
    cubxTasks.forEach(function (cubxTask) {
      grunt.log.writeln(' ' + chalk.green(cubxTask.name) + ' => ' + cubxTask.info);
    });
  });
};
