var chai = require('chai')
  , expect = chai.expect
  , path = require('path')
  , Q = require('q')
  , util = require('../lib/hw-util');

describe('External command execution', function () {
  it('should execute test.sh and check out and err', function (done) {
    Q().
      then(function () {
        var deferred = Q.defer();
        util.exec(path.join(__dirname, '..', 'etc', 'test.sh'), null, null, deferred.makeNodeResolver());
        return deferred.promise;
      }).
      spread(function (out, err) {
        expect(out).to.equal('hello\n');
      }).
      then(done).
      catch(done);
  });
  it('should execute test.sh with handlers', function (done) {
    var outContent, errContent;
    outContent = '';
    errContent = '';
    Q().
      then(function () {
        var deferred = Q.defer();
        util.exec(path.join(__dirname, '..', 'etc', 'test.sh'), ['true'], null, deferred.makeNodeResolver(), outHandler, errHandler);
        return deferred.promise;
      }).
      then(function () {
        expect(outContent).to.equal('hello\n');
        expect(errContent).to.equal('example of error\n');
      }).
      then(done).
      catch(done);

    function outHandler(data) {
      outContent += data;
    }

    function errHandler(data) {
      errContent += data;
    }
  });
});