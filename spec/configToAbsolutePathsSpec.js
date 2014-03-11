var chai = require('chai')
  , expect = chai.expect
  , util = require('../lib/hw-util');

describe('configToAbsolutePaths', function () {
  it('should modify the relative paths in object properties', function () {
    var config;
    config = {
      path1: './a',
      a: 2,
      b: 3
    };
    util.configToAbsolutePaths(config, '/apath/bpath');
    expect(config).to.eql({
      path1: '/apath/bpath/a',
      a: 2,
      b: 3
    });
  });
});