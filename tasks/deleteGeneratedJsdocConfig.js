'use strict';

module.exports = function (grunt) {
  grunt.registerTask('deleteGeneretedJsdocConfig', 'delete jsdoc configuration', function () {
    var filepath = grunt.config.get('param.src') + '/jsdoc-config.json';
    console.log('filepath', filepath);
    grunt.file.delete(filepath, { force: true });
  });
};
