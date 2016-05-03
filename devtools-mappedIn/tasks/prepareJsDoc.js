'use strict';

module.exports = function (grunt) {
  grunt.registerTask('prepareJsdoc', 'prepare jsdoc configuration', function () {
    var jsdocConfig;
    jsdocConfig = grunt.file.readJSON('jsdoc-config.json');
    if (!jsdocConfig) {
      grunt.fail.fatal('Jsdoc config file not found.');
    }
    var manifestWebpackagePath = grunt.config.get('param.src') + '/manifest.webpackage';
    var manifestWebpackage = grunt.file.readJSON(manifestWebpackagePath);

    var name = manifestWebpackage.author.name;
    var systemName = manifestWebpackage.groupId + '.' + manifestWebpackage.name + '@' + manifestWebpackage.version;

    jsdocConfig.templates.systemName = systemName;
    jsdocConfig.templates.footer = name;
    jsdocConfig.templates.copyright = name + ' © 2014-2016';
    var dest;
    dest = grunt.config.get('param.src') + '/jsdoc-config.json';
    grunt.file.write(dest, JSON.stringify(jsdocConfig, null, 2));
  });
};
