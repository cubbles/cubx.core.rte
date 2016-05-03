window.cubx.amd.define([ 'utils' ], function (utils) {
  'use strict';

  describe('Utils', function () {
    describe('Array', function () {
      // provide some basic objects/values for testing
      var itemString = 'testItem';
      var itemBoolean = false;
      var itemNumber = 2;
      var itemObject = {
        prop1: 'prop1',
        prop2: {
          prop2_1: 21,
          prop2_2: true
        }
      };
      var array = [];
      var arrayExpected1 = [ true, 1, itemString, 'item3', { prop: 'item4' } ];
      var arrayExpected2 = [ true, 1, itemBoolean, 'item3', { prop: 'item4' } ];
      var arrayExpected3 = [ true, 1, itemNumber, 'item3', { prop: 'item4' } ];
      var arrayExpected4 = [ true, 1, itemObject, 'item3', { prop: 'item4' } ];

      describe('#insertItemAtIndex()', function () {
        beforeEach(function () {
          array.splice(0, array.length);
          array.push(true, 1, 'item3', { prop: 'item4' });
        });
        it('should insert item at given index in given array if item is of type string', function () {
          utils.Array.insertItemAtIndex(array, itemString, 2);
          array.should.have.length(arrayExpected1.length);
          array.should.eql(arrayExpected1);
        });
        it('should insert item at given index in given array if item is of type boolean', function () {
          utils.Array.insertItemAtIndex(array, itemBoolean, 2);
          array.should.have.length(arrayExpected2.length);
          array.should.eql(arrayExpected2);
        });
        it('should insert item at given index in given array if item is of type number', function () {
          utils.Array.insertItemAtIndex(array, itemNumber, 2);
          array.should.have.length(arrayExpected3.length);
          array.should.eql(arrayExpected3);
        });
        it('should insert item at given index in given array if item is of type object', function () {
          utils.Array.insertItemAtIndex(array, itemObject, 2);
          array.should.have.length(arrayExpected4.length);
          array.should.eql(arrayExpected4);
        });
      });
      describe('#insertBefore()', function () {
        var arrayExpected;
        beforeEach(function () {
          array.splice(0, array.length);
          array.push(true, 1, 'item3', { prop: 'item4' });
        });
        it('should insert insertItem before given item in given array', function () {
          arrayExpected = [ true, 1, 'item3', itemObject, { prop: 'item4' } ];
          utils.Array.insertBefore(array, itemObject, array[ 3 ]);
          array.should.have.length(arrayExpected.length);
          array.should.eql(arrayExpected);
        });
        it('should insert insertItem at the end of given array if given item is not in array', function () {
          arrayExpected = [ true, 1, 'item3', { prop: 'item4' }, itemObject ];
          utils.Array.insertBefore(array, itemObject, itemString);
          array.should.have.length(arrayExpected.length);
          array.should.eql(arrayExpected);
        });
        it('should return index of inserted item', function () {
          expect(utils.Array.insertBefore(array, itemObject, array[ 3 ])).to.equal(3);
        });
      });
      describe('#removeItemFromArray()', function () {
        beforeEach(function () {
          array.splice(0, array.length);
          array.push(true, 1, 'item3', itemObject, { prop: 'item4' });
        });
        it('should remove given item from array', function () {
          var arrayExpected = [ true, 1, 'item3', { prop: 'item4' } ];
          utils.Array.removeItemFromArray(array, itemObject);
          array.should.have.length(arrayExpected.length);
          array.should.eql(arrayExpected);
        });
        it('should throw an error if given item is not in array', function () {
          expect(function () {
            utils.Array.removeItemFromArray(array, itemString);
          }).to.throw(Error);
        });
      });
    });
  });
});
