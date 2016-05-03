module.exports = function (grunt) {
  'use strict';

  grunt.registerMultiTask('check-crc-version', 'compare cubx.corerte version to crc._version',
    function () {
      // read
      if (!this.data) {
        grunt.fail.fatal('please configure the attributes "manifestFile" and "crcFile".');
      }
      if (!this.data.manifestFile) {
        grunt.fail.fatal('please configure the attribute "manifestFile".');
      }
      if (!this.data.crcFile) {
        grunt.fail.fatal('please configure the attribute "crcFile".');
      }
      var manifest = grunt.file.readJSON(this.data.manifestFile);
      var manifestVersion;
      if (manifest.name === 'rte' && manifest.groupId === 'cubx.core') {
        manifestVersion = manifest.version;
      } else {
        grunt.fail.fatal('check-crc-version is just for cubx.core.rte webpackage avaible!');
        return;
      }
      var crc = grunt.file.read(this.data.crcFile);
      var regex = /(this._version = ')(\d{1,2}\.\d{1,2}\.?(?:\d{1,2})?(?:-SNAPSHOT)?)(';)/;
      var match = regex.exec(crc);
      var crcVersion = match[ 2 ];
      if (crcVersion !== manifestVersion) {
        grunt.fail.fatal(
          'The version of cubx.core.rte (' + manifestVersion + ') must be equal to crc._version (' +
          crcVersion + ')!');
      } else {
        grunt.log.ok(
          'check ok - cubx.core.rte (' + manifestVersion +
          ') is equals to crc._version (' + crcVersion + ')');
      }
    });
};
