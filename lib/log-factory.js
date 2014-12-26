var pkg = require('../package')
  , util = require('util')
  , defaultNamespace = pkg.name
  , nodeDebug, debug, logFactory, addLoggerLevel;

addLoggerLevel = function (level) {
  logFactory.logFuncs[level] = nodeDebug(util.format('%s:%s', defaultNamespace, level));
};

logFactory = function (modName, extraLevels) {
  if (typeof extraLevels === 'string') {
    extraLevels = [extraLevels];
  }
  if (extraLevels) {
    extraLevels.forEach(function (level) {
      if (logFactory.levels.indexOf(level) === -1) {
        addLoggerLevel(level);
        logFactory.levels.push(level);
      }
    });
  }
  return (function createLogger() {
    var logger;
    logger = {};
    logFactory.levels.forEach(function (level) {
      logger[level] = function () {
        var logFunc, logMsg;
        logFunc = logFactory.logFuncs[level];
        logMsg = util.format.apply(this, arguments);
        logFunc.call(this, util.format('%s - %s', modName, logMsg));
      };
    });
    return logger;
  })();
};

logFactory.setLevel = function (level) {
  var util = require('./hw-util');
  var levels = [];
  switch (level) {
    case 'trace':
      levels.push('trace');
    /* falls through */
    case 'debug':
      levels.push('debug');
    /* falls through */
    case 'info':
      levels.push('info');
    /* falls through */
    case 'warn':
      levels.push('warn');
    /* falls through */
    case 'error':
      levels.push('error');
  }
  process.env.DEBUG = util.format('*:%s', levels.join('|'));
  util.unloadModule('debug', 'debug/debug');
  nodeDebug = require('debug');
  debug = require('debug/debug');
};

logFactory.isLevelEnabled = function (level) {
  return debug.enabled(':' + level);
};

logFactory.init = function (namespace) {
  logFactory.levels = ['error', 'warn', 'info', 'debug', 'trace'];
  logFactory.logFuncs = {};
  defaultNamespace = namespace;
  nodeDebug = require('debug');
  debug = require('debug/debug');
  nodeDebug.colors = [
    4 // debug
    , 2 // info
    , 6 // trace
    , 1 // error
    , 5 // warn
    , 3 // other
  ];
  logFactory.levels.forEach(addLoggerLevel);
};

logFactory.init(defaultNamespace);

exports = module.exports = logFactory;