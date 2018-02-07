'use strict';
var fs = require('fs');
var path = require('path');
module.exports = function (grunt, workspacePath) {
  var workspaceConfigFile = path.join(workspacePath, '.workspace');
  grunt.verbose.writeln('validate: ' + workspaceConfigFile);
  var workspaceConfigTemplate = {
    activeWebpackage: '',
    remoteStoreUrl: 'https://cubbles.world/sandbox'
  };
  if (!grunt.file.isFile(workspaceConfigFile)) {
    grunt.verbose.writeln('Did NOT found ' + workspaceConfigFile);
    grunt.log.writeln('Creating file \'' + workspaceConfigFile + '\' ... ');
    (function () {
      grunt.file.write(workspaceConfigFile, JSON.stringify(workspaceConfigTemplate, null, 2));
      grunt.log.writeln('Done.');
    })();
  } else {
    grunt.verbose.writeln('Found ' + workspaceConfigFile);
  }
  /*
   * read workspaceConfigFile -file and validate content
   */
  var workspaceConfig;
  var configNeedSave = false;
  try {
    workspaceConfig = grunt.file.readJSON(workspaceConfigFile);
  } catch (err) {
    workspaceConfig = workspaceConfigTemplate;
    configNeedSave = true;
  }
  var activeWebpackageName;
  if (!('activeWebpackage' in workspaceConfig)) {
    workspaceConfig.activeWebpackage = workspaceConfigTemplate.activeWebpackage;
    configNeedSave = true;
  }
  if (!('remoteStoreUrl' in workspaceConfig)) {
    workspaceConfig.remoteStoreUrl = workspaceConfigTemplate.remoteStoreUrl;
    configNeedSave = true;
  }
  if (configNeedSave) {
    grunt.file.write(workspaceConfigFile, JSON.stringify(workspaceConfig, null, 2));
  }
  if (('activeWebpackage' in workspaceConfig) && typeof workspaceConfig.activeWebpackage === 'string' &&
    workspaceConfig.activeWebpackage.length > 0) {
    activeWebpackageName = workspaceConfig.activeWebpackage;
    grunt.log.subhead('Currently mapped Webpackage: ' + activeWebpackageName + ' (@see ' +
      workspaceConfigFile + ')');
  } else {
    grunt.log.warn('Currently there is NO active Webpackage configured. Please check \'' + workspaceConfigFile +
      '\'');
  }

  // does the mapped folder exist?
  if (activeWebpackageName) {
    var activeWebpackagePath = path.join(workspacePath, activeWebpackageName);
    if (!grunt.file.isDir(activeWebpackagePath)) {
      grunt.log.error('Mapped folder does NOT exist. Please check \'' + workspaceConfigFile + '\'');
      return;
    }
    // does the manifest.webpackage file has corresponding values for groupId and name?
    var manifestFilePath = path.join(activeWebpackagePath, 'manifest.webpackage');
    if (!grunt.file.isFile(manifestFilePath)) {
      grunt.log.error('File \'' + manifestFilePath + '\' does NOT exist. Please check your WebPackage.');
      return;
    }
    //
    var manifest = grunt.file.readJSON(manifestFilePath);
    var webpackageCommonName = manifest.groupId ? manifest.groupId + '.' + manifest.name : manifest.name;
    if (activeWebpackageName !== webpackageCommonName) {
      grunt.log.error('Expected the folder to be named \'' + webpackageCommonName + '\'. Running a fix ...');
      // rename the folder
      fs.renameSync(path.join(workspacePath, activeWebpackageName), path.join(workspacePath, webpackageCommonName), function (err) {
        if (err) {
          grunt.log.error();
          grunt.verbose.error();
          grunt.fail.warn(
            'Fix operation failed. Please do update the folder name to \'' + webpackageCommonName +
            '\' manually.');
        }
      });
      // update .workspace file to point to the new folder name
      workspaceConfig.activeWebpackage = webpackageCommonName;
      grunt.file.write(workspaceConfigFile, JSON.stringify(workspaceConfig, null, 2));

      grunt.log.error('Fixed.');
    }
  }
};
