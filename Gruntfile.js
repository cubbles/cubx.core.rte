/* global process, __dirname */
'use strict';
var path = require('path');
var _ = require('lodash');

module.exports = function (grunt) {
  /**
   *  Load grunt tasks
   */
  grunt.loadTasks('tasks'); // locally defined tasks
  require('load-grunt-tasks')(grunt, {
    pattern: [
      'grunt-*',
      'gruntify-*',
      '@*/grunt-*',
      'cubx-grunt-*',
      '@*/cubx-grunt-*',
      'web-component-tester' ]
  });

  /**
   * In case of starting the default-task, ignore the rest of this file.
   */
  var taskFromCmd = process.argv[ 2 ];
  if (!taskFromCmd || taskFromCmd === 'default') {
    return;
  }

  /**
   * Detect and validate the workspace
   */

  var workspaceName = 'webpackages';
  var workspacePath = require('./lib/detect-workspace.js')(grunt, workspaceName);
  var workspaceConfigPath = path.join(workspacePath, '.workspace');
  grunt.verbose.writeln('workspacePath: ' + workspacePath);
  grunt.verbose.writeln('workspaceConfigPath: ' + workspaceConfigPath);
  require('./lib/validate-workspace.js')(grunt, workspacePath);

  /**
   * Define default options
   */
  var options = {
    devtools: grunt.file.readJSON('package.json'),
    devtoolsPath: __dirname,
    workspaceName: workspaceName,
    workspacePath: workspacePath,
    workspaceConfigPath: workspaceConfigPath,
    workspaceConfig: grunt.file.readJSON(workspaceConfigPath),
    param: {
      tmp: '.tmp'
    },
    config: { // set default configs location
      src: [ 'tasks/configs/*.js', path.join(workspacePath, '**', 'grunt-wct*.js') ]
    }
  };

  /**
   * Analyse workspace. If webpackage configured extend the options.
   */
  var config = grunt.file.readJSON(workspaceConfigPath);
  // update the enviroment variable for proxy, if configured.
  updateProxyConfig(config);
  var activeWebpackage = config.activeWebpackage;
  if (activeWebpackage && activeWebpackage.length > 0) {
    var activeWebpackageConfigPath = path.join(workspacePath, activeWebpackage, '.webpackage');
    var manifestWebpackagePath = path.join(workspacePath, activeWebpackage, 'manifest.webpackage');
    // If manifestFile exist, define webpackage-related options and merge them into the default-options
    if (grunt.file.isFile(manifestWebpackagePath) && grunt.file.isFile(activeWebpackageConfigPath)) {
      var manifestFileAsJSON = grunt.file.readJSON(manifestWebpackagePath);
      (function () {
        // Webpackage related grunt options
        var webpackageRelatedOptions = {
          workspaceConfigObject: config,
          activeWebpackage: activeWebpackage,
          activeWebpackageConfigPath: activeWebpackageConfigPath,
          activeWebpackageConfig: grunt.file.readJSON(activeWebpackageConfigPath),
          manifestWebpackagePath: manifestWebpackagePath,
          manifestWebpackage: manifestFileAsJSON,
          param: {
            src: path.join(workspacePath, activeWebpackage),
            dst: path.join(workspacePath, activeWebpackage + '@' + manifestFileAsJSON.version),
            doc: path.join('..', 'docs', activeWebpackage)
          }
        };
        options = _.merge(options, webpackageRelatedOptions);
      })();
    } else {
      grunt.fail.fatal('Declared \'activeWebpackage\' NOT found or missing one of the expected files\n' +
        '* manifest.webpackage\n' +
        '* .webpackage\n' +
        'Please check ' + workspaceConfigPath + ' and the webpackage-folder.');
    }
  }

  /**
   * Load config from config-files and pass options usable as config-values
   */
  var configs = require('load-grunt-configs')(grunt, options);
  grunt.initConfig(configs);

  function updateProxyConfig (workSpaceConfig) {
    if (workSpaceConfig && workSpaceConfig.https_proxy) {
      process.env.https_proxy = workSpaceConfig.https_proxy;
    }
    if (workSpaceConfig && workSpaceConfig.http_proxy) {
      process.env.http_proxy = workSpaceConfig.http_proxy;
    }
  }
};

