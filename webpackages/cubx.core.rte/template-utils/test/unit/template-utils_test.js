'use strict';
describe('template-utils', function () {
  describe('#findTemplate', function () {
    before(function (done) {
      var promises = [];
      function createHtmlImport (path) {
        return new Promise(function (resolve, reject) {
          var link = document.createElement('link');
          link.setAttribute('rel', 'import');
          link.setAttribute('href', path);
          link.onload = function () {
            resolve(link);
          };
          document.body.appendChild(link);
        });
      }

      promises.push(createHtmlImport('base/test/resources/template-1.html'));
      promises.push(createHtmlImport('base/test/resources/template-2.html'));
      promises.push(createHtmlImport('base/test/resources/template-3.html'));
      Promise.all(promises).then(function (results) {
        done();
      });
    });

    it('find the template for dummy-element', function (done) {
      var elementName = 'dummy-element';
      var promise = window.cubx.utils.findTemplate(elementName);
      promise.then(function (results) {
        var template;
        for (var i = 0; i < results.length; i++) {
          var result = results[ i ];
          if (typeof result === 'object') {
            template = result;
            break;
          }
        }
        expect(template).to.be.exists;
        template.id.should.be.equal(elementName);
        done();
      });
    });
    it('find the template for dummy-element-2', function (done) {
      var elementName = 'dummy-element-2';
      var promise = window.cubx.utils.findTemplate(elementName);
      promise.then(function (results) {
        var template;
        for (var i = 0; i < results.length; i++) {
          var result = results[ i ];
          if (typeof result === 'object') {
            template = result;
            break;
          }
        }
        expect(template).to.be.exist;
        template.id.should.be.equal(elementName);
        done();
      });
    });
    it('find the template for dummy-element-3', function (done) {
      var elementName = 'dummy-element-3';
      var promise = window.cubx.utils.findTemplate(elementName);
      promise.then(function (results) {
        var template;
        for (var i = 0; i < results.length; i++) {
          var result = results[ i ];
          if (typeof result === 'object') {
            template = result;
            break;
          }
        }
        expect(template).to.be.exist;
        template.id.should.be.equal(elementName);
        done();
      });
    });
  });
});
