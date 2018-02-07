/**
 * This prepares the current project to map-in the devTools from it's source repository.
 */
'use strict';
var sh = require('shelljs');
/**
 * This task prepares your project to map-in the 'cubbles-coder-devtools'
 * @param {object} grunt
 */
module.exports = function (grunt) {
  grunt.registerTask('prepare-cubx.devtools-asGitSubtree',
    'prepare to map-in \'cubbles-coder-devtools\' from git via \'git subtree\'', function () {
      var workDirectory = sh.pwd();
      // check if git is installed
      if (!sh.which('git')) {
        grunt.fail.fatal('Sorry, this feature requires git.');
      }

      // check, if project is under git source control
      //        sh.cd('..');
      var gitStatus = sh.exec('git status', { silent: true }).code;
      if (gitStatus === 128) {
        grunt.fail.fatal('Expected to find the directory \'' + sh.pwd() + '\' to be under git-source-control.');
      }

      // install git-subtree globally to have it available on project-level
      var commandInstallGitsubtree = 'npm install -g git-subtree';
      grunt.log.writeln('Running ' + commandInstallGitsubtree);
      sh.exec(commandInstallGitsubtree);

      // write config for git-subtree command
      sh.cd(workDirectory);
      var subtreesFilename = '../subtrees.json';
      var subtreesFileContent = {
        'devtools': {
          'localFolder': 'devtools-mappedIn',
          'repository': 'https://github.com/cubbles/cubbles-coder-devtools.git',
          'branch': 'master'
        }
      };
      grunt.file.write(subtreesFilename, JSON.stringify(subtreesFileContent, null, 2));

      // show usage notes
      grunt.log.writeln('\nSubtreeConfig saved to ' + workDirectory + '/' + subtreesFilename + '.');
      grunt.log.writeln('Now run:');
      grunt.log.writeln('\'$ git-subtree init\' to include the subtree.');
      grunt.log.writeln('\'$ git-subtree pull\' to update the subtree.');
      grunt.log.writeln('@see https://www.npmjs.com/package/git-subtree for detailed usage notes.');
    });
};
