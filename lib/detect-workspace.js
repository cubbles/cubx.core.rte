'use strict';
var path = require('path');
module.exports = function (grunt, workspaceName) {
  var defaultWorkspacePath = path.join('..', workspaceName);
  var alternativeWorkspacePath = path.join('.', workspaceName);

  if (grunt.file.isDir(defaultWorkspacePath)) {
    return defaultWorkspacePath;
  } else if (grunt.file.isDir(alternativeWorkspacePath)) {
    return alternativeWorkspacePath;
  }
  // also if it does not exist, return the default path
  return defaultWorkspacePath;
};
