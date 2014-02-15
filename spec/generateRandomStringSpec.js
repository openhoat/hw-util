var chai = require('chai')
  , expect = chai.expect
  , util = require('../lib/hw-util');

function checkGeneratedRandomString(length, filter, checkRegexp, loop) {
  var i, result;
  loop = loop || 1;
  for (i = 0; i < loop; i++) {
    result = util.generateRandomString(length, filter);
    expect(result.length).to.equal(length);
    expect(result.match(new RegExp(util.format('%s{%s}', checkRegexp, length), 'g'))).ok;
  }
}

describe('generate random string', function () {
  it('should generate a 5 length random string containing [a-z0-9]', function () {
    checkGeneratedRandomString(5, null, '[a-z0-9]');
  });
  it('should generate a 3 length random string containing 0-9', function () {
    checkGeneratedRandomString(3, '0123456789', '[0-9]');
  });
  it('should generate 20 times a 100 length random string containing X or y', function () {
    checkGeneratedRandomString(100, 'Xy', '[Xy]', 20);
  });
});