var util = require('../lib/hw-util')
  , chai = require('chai');

chai.should();

describe('util.logFactory', function () {
  it('should log message with specified level', function () {
    var logFactory = util.logFactory
      , log, restoreStdout, restoreStderr, resultStdout, resultStderr
      , namespace = 'hw-util'
      , module = 'logFactorySpec'
      , msg = 'This is a log message'
      , expected;

    function buildExpectedLogRegExp(level) {
      return new RegExp(util.format('.*%s:%s .*%s - %s.*\n', namespace, level, module, msg));
    }

    resultStdout = [];
    resultStderr = [];
    logFactory.setLevel('info');
    restoreStdout = util.hookStdout(function (s) {
      resultStdout.push(s);
    });
    restoreStderr = util.hookStderr(function (s) {
      resultStderr.push(s);
    });
    logFactory.init(namespace);
    log = logFactory(module);
    log.trace(msg);
    log.info(msg);
    log.error(msg);
    log.warn(msg);
    log.debug(msg);
    restoreStdout();
    restoreStderr();
    expected = ['info', 'error', 'warn'];
    resultStdout.should.be.empty;
    resultStderr.should.have.length(expected.length);
    expected.forEach(function (level, index) {
      resultStderr[index].should.match(buildExpectedLogRegExp(level));
    });
  });
});