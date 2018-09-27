/* globals mocha, chai */
'use strict';
mocha.setup({
  ui: 'bdd',
  globals: [ 'cubx', 'manifestCache', 'manifestComponent' ]
});
/* eslint-disable no-unused-vars */
var assert = chai.assert;
var expect = chai.expect;
// Note that should has to be executed
var should = chai.should();
/* eslint-enable no-unused-vars */
