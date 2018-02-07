'use strict';

module.exports.tasks = {
  githooks: {
    all: {
      options: {
        dest: '../.git/hooks'
      },
      'pre-commit': '_validateSources'
    }
  },
  clean: {
    docs: [ '<%= param.doc %>/' ]
  }
};
