var chai = require('chai')
  , expect = chai.expect
  , util = require('../lib/hw-util');

describe('delete properties', function () {
  it('should remove some properties from object', function () {
    var o;
    o = {
      '__v': 0,
      '_id': '52879cc8ceee8cad15000001',
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    };
    util.deleteProperties(o, null, ['__v', '_id']);
    expect(o).to.eql({
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    });
  });
  it('should remove all properties from object', function () {
    var o;
    o = {
      '__v': 0,
      '_id': '52879cc8ceee8cad15000001',
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    };
    util.deleteProperties(o);
    expect(o).to.eql({});
  });
  it('should remove all properties from object except hits and url', function () {
    var o;
    o = {
      '__v': 0,
      '_id': '52879cc8ceee8cad15000001',
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    };
    util.deleteProperties(o, null, null, ['hits', 'url']);
    expect(o).to.eql({
      'url': 'http://www.some.org',
      'hits': 2
    });
  });
});