var chai = require('chai')
  , expect = chai.expect
  , path = require('path')
  , Q = require('q')
  , util = require('../lib/hw-util');

describe('External command execution', function () {
  it('should execute test.sh asynchronously', function (done) {
    Q().
      then(function () {
        var deferred = Q.defer();
        util.exec(path.join(__dirname, '..', 'etc', 'test.sh'), deferred.makeNodeResolver());
        return deferred.promise;
      }).
      then(function (out) {
        expect(out).ok;
      }).
      then(done).
      catch(done);
  });
});