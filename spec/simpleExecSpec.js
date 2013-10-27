var path = require('path')
  , util = require('../lib/hw-util');

describe('External command execution', function () {
  it('should execute test.sh asynchronously', function () {
    var completed;
    completed = false;
    runs(function () {
      util.exec(path.join(__dirname, '..', 'etc', 'test.sh'), function (err, out) {
        expect(err).toBeFalsy();
        expect(out).toBeTruthy();
        completed = true;
      });
    });
    waitsFor(function () {
      return completed;
    }, 3000);
  });
});