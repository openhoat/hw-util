var util = require('../lib/hw-util');

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
    expect(dest).toBeTruthy();
    expect(JSON.stringify(dest)).toBe(JSON.stringify({
      'id': '52879cc8ceee8cad15000001',
      'path1': 'so',
      'path2': 'me',
      'url': 'http://www.some.org',
      'hits': 2,
      'createdAt': '2013-11-16T16:26:48.505Z'
    }));
  });
});