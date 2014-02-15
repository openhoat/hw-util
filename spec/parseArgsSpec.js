var chai = require('chai')
  , expect = chai.expect
  , util = require('../lib/hw-util');

describe('parse optional function args', function () {
  it('should return 3 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: true, type: 'string' }
      ]);
      expect(result).to.eql({
        obj: { a: 4 },
        s1: 'a',
        s2: 'b'
      });
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
      expect(result).to.eql({
        s1: 'a',
        s2: 'b',
        obj: undefined
      });
    })('a', 'b');
  });
  it('should return 1 arg', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: true, type: 'string' }
      ]);
      expect(result).to.eql({
        s1: 'a',
        obj: undefined,
        s2: undefined
      });
    })('a');
  });
  it('should return 1 arg', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 'obj', optional: true, type: 'object' },
        { name: 's1', optional: true, type: 'string' },
        { name: 's2', optional: false, type: 'string' }
      ]);
      expect(result).to.eql({
        s2: 'a',
        s1: undefined,
        obj: undefined
      });
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
      expect(result).to.eql({
        s2: 'b',
        a: [ 3, 4, 5 ],
        s1: undefined
      });
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
      expect(result).to.eql({
        s1: 'b',
        a: [ 3, 4, 5 ],
        s2: undefined
      });
    })('b', [3, 4, 5]);
  });
  it('should return 3 args', function () {
    (function () {
      var result;
      result = util.parseArgs(arguments, [
        { name: 's1', optional: false, type: 'string' },
        { name: 's2', optional: true, type: 'string', defaultValue: 'z' },
        { name: 'a', optional: false, type: 'object', objectType: Array }
      ]);
      expect(result).to.eql({
        s1: 'b',
        a: [ 3, 4, 5 ],
        s2: 'z'
      });
    })('b', [3, 4, 5]);
  });
});