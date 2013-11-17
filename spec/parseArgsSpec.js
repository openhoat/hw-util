var util = require('../lib/hw-util');

describe('parse optional function args', function () {
  it('should return 3 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: true, type: 'string' }
      ]);
      expect(result).toBeTruthy();
      expect(JSON.stringify(result)).toBe(JSON.stringify({
        obj: { a: 4 },
        s1: 'a',
        s2: 'b'
      }));
    })({ a: 4 }, 'a', 'b');
  });
  it('should return 2 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: true, type: 'string' }
      ]);
      expect(result).toBeTruthy();
      expect(JSON.stringify(result)).toBe(JSON.stringify({
        s1: 'a',
        s2: 'b'
      }));
    })('a', 'b');
  });
  it('should return 1 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: true, type: 'string' }
      ]);
      expect(result).toBeTruthy();
      expect(JSON.stringify(result)).toBe(JSON.stringify({
        s1: 'a'
      }));
    })('a');
  });
  it('should return 1 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: false, type: 'string' }
      ]);
      expect(result).toBeTruthy();
      expect(JSON.stringify(result)).toBe(JSON.stringify({
        s2: 'a'
      }));
    })('a');
  });
  it('should return 2 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: false, type: 'string' },
        { name: 'a', optional: false, type: 'object', objectType: Array }
      ]);
      expect(result).toBeTruthy();
      expect(JSON.stringify(result)).toBe(JSON.stringify({
        s2: 'b',
        a: [ 3, 4, 5 ]
      }));
    })('b', [3, 4, 5]);
  });
  it('should return 2 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 's1', optional: false, type: 'string' },
        { name: 's2', optional: true, type: 'string' },
        { name: 'a', optional: false, type: 'object', objectType: Array }
      ]);
      expect(result).toBeTruthy();
      expect(JSON.stringify(result)).toBe(JSON.stringify({
        s1: 'b',
        a: [ 3, 4, 5 ]
      }));
    })('b', [3, 4, 5]);
  });
});