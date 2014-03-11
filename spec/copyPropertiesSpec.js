var chai = require('chai')
  , expect = chai.expect
  , util = require('../lib/hw-util');

describe('copy properties', function () {
  it('should return a new object with a copy of some properties', function () {
    var src, dest;
    src = {
      '__v': 0,
      '_id': '52879cc8ceee8cad15000001',
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    };
    dest = util.copyProperties(src, null, false, ['__v'], null, { '_id': 'id' });
    expect(dest).to.eql({
      'id': '52879cc8ceee8cad15000001',
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    });
  });
  it('should add properties to object', function () {
    var src = { a: { b: 1, c: 2 } }
      , dest = { a: { d: 3 } };
    util.copyProperties(src, dest, false);
    expect(dest).to.eql({ a: { b: 1, c: 2, d: 3 } });
  });
  it('should copy complex object', function () {
    var src = { a: 1, stream: process.stdout, c: 3 }
      , dest = { b: 2, c: 4 };
    util.copyProperties(src, dest, false);
    expect(dest).to.be.ok;
    expect(dest.a).to.equal(1);
    expect(dest.b).to.equal(2);
    expect(dest.c).to.equal(3);
    expect(dest.stream).to.equal(process.stdout);
  });
});