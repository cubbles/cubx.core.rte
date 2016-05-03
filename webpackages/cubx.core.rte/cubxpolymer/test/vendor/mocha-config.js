mocha.setup({
    ui: 'bdd',
    globals: [ 'cubx' , 'manifestCache', 'manifestComponent']
});
var assert = chai.assert;
var expect = chai.expect;
// Note that should has to be executed
var should = chai.should();

