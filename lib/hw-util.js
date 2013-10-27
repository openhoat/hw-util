var util;

util = {
  compileConfig: function (config) {
    if (config.envs && config.env && config.envs[config.env]) {
      util.copyProperties(config.envs[config.env], config, false, ['envs']);
      delete config.envs;
    }
  },
  copyProperties: function (src, dest, onlyExisting, exclude) {
    var key;
    if (typeof onlyExisting === 'undefined') {
      onlyExisting = typeof dest !== 'undefined';
    }
    if (typeof dest === 'undefined') {
      dest = {};
    }
    for (key in src) {
      if (exclude && exclude.indexOf(key) !== -1) {
        continue;
      }
      if (src.hasOwnProperty(key) && (!onlyExisting || dest.hasOwnProperty(key))) {
        if (typeof src[key] === 'object' && typeof dest[key] === 'object' && !(dest[key] instanceof Array) && dest[key] !== null) {
          if (src[key] === null) {
            dest[key] = src[key];
          } else {
            util.copyProperties(src[key], dest[key], onlyExisting);
          }
        } else {
          dest[key] = src[key];
        }
      }
    }
    return dest;
  },
  execCmd: function (cmd, params, options, callback, stdoutHandler, stderrHandler) {
    var childProcess = require('child_process')
      , process, out, err;
    if (typeof callback === 'undefined') {
      if (typeof options === 'undefined' && typeof params === 'function') {
        callback = params;
        params = null;
      } else if (typeof options === 'function') {
        callback = options;
        options = null;
      }
    }
    callback = util.safeCallback(callback);
    if (params && !Array.isArray(params)) {
      params = [params];
    }
    process = childProcess.spawn(cmd, params, options);
    if (stdoutHandler) {
      process.stdout.on('data', stdoutHandler);
    } else {
      process.stdout.on('data', function (data) {
        out = out || '';
        out += data;
      });
    }
    if (stderrHandler) {
      process.stderr.on('data', stderrHandler);
    } else {
      process.stderr.on('data', function (data) {
        err = err || '';
        err += data;
      });
    }
    process.on('close', function (code) {
      callback(code, out, err);
    });
  },
  extend: function (origin, add, replaceExisting) {
    var keys, i;
    if (!add || typeof add !== 'object') return origin;
    keys = Object.keys(add);
    i = keys.length;
    while (i--) {
      if (replaceExisting || typeof origin[keys[i]] === 'undefined') {
        origin[keys[i]] = add[keys[i]];
      }
    }
    return origin;
  },
  getHostnameFromRequest: function (req) {
    var hostInfos, hostname;
    hostInfos = req.headers['host'].split(':');
    hostname = hostInfos[0];
    return hostname;
  },
  hackArgs: function (o, methodName, callback) {
    var origMethod = o[methodName];
    callback = util.safeCallback(callback);
    o[methodName] = function () {
      return origMethod.apply(this, callback.apply(this, arguments) || arguments);
    };
  },
  handleSignal: function (callback) {
    [
      'SIGABRT',
      'SIGALRM', 'SIGVTALRM', 'SIGPROF',
      'SIGBUS',
      'SIGCHLD',
      'SIGCONT',
      'SIGFPE',
      'SIGHUP',
      'SIGILL',
      'SIGINT',
      'SIGKILL',
      'SIGPIPE',
      'SIGQUIT',
      'SIGSEGV',
      'SIGSTOP',
      'SIGTERM',
      'SIGTSTP',
      'SIGTTIN', 'SIGTTOU',
      'SIGUSR1', 'SIGUSR2',
      'SIGPOLL',
      'SIGSYS',
      'SIGTRAP',
      'SIGURG',
      'SIGXCPU',
      'SIGXFSZ',
      'SIGRTMIN', 'SIGRTMAX',
      'SIGEMT',
      'SIGINFO',
      'SIGPWR',
      'SIGLOST',
      'SIGWINCH',
      'exit'
    ].forEach(function (signal) {
        process.on(signal, function (code) {
          callback(signal, code);
        });
      });
  },
  hash: function (s, encoding) {
    var crypto = require('crypto')
      , shasum;
    shasum = crypto.createHash('sha1');
    shasum.update(s);
    return shasum.digest(encoding || 'base64');
  },
  hashMongoDbPassword: function (username, pwd) {
    var crypto = require('crypto')
      , shasum;
    shasum = crypto.createHash('md5');
    shasum.update(username + ':mongo:' + pwd);
    return shasum.digest('hex');
  },
  noop: function () {
  },
  safeCallback: function (callback) {
    return callback || util.noop;
  },
  toArrayBuffer: function (buffer) {
    var ab, view, i;
    ab = new ArrayBuffer(buffer.length);
    view = new Uint8Array(ab);
    for (i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
  },
  reverse: function (str) {
    return str.split('').reduce(function (a, b) {
      return b + a
    }, '');
  },
  now: function () {
    return process.hrtime();
  },
  elapsedTime: function (start, unit) {
    var elapsed, q;
    q = eval('1E' + unit);
    elapsed = process.hrtime(start);
    return parseInt(elapsed[0] * q + elapsed[1] / (1E9 / q), 10);
  },
  elapsedTimeMs: function (start) {
    return util.elapsedTime(start, 3);
  },
  elapsedTimeMicros: function (start) {
    return util.elapsedTime(start, 6);
  },
  elapsedTimeNs: function (start) {
    return util.elapsedTime(start, 9);
  },
  elapsedTimeSec: function (start) {
    return util.elapsedTime(start, 0);
  },
  arrayToProperties: function (array, obj, propPrefix, startIndex) {
    var index;
    propPrefix = propPrefix || 'prop';
    startIndex = startIndex || 0;
    index = startIndex;
    array.forEach(function (item) {
      obj[propPrefix + index] = item;
      index++;
    });
  },
  scanTests: function (objToScan, testObj) {
    var scan;
    scan = function (obj, testName) {
      var key;
      testName = testName ? testName + '_' : '';
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'function') {
            testObj[testName + key] = obj[key];
          } else if (typeof obj[key] === 'object') {
            scan(obj[key], testName + key);
          }
        }
      }
    };
    scan(objToScan);
  },
  exec: function (cmd, args, options, callback) {
    var childProcess = require('child_process')
      , command, child, stdout, stderr;
    if (typeof callback === 'undefined') {
      callback = options;
      if (typeof callback === 'undefined') {
        callback = args;
      }
    }
    command = {
      file: null,
      args: [],
      options: null
    };
    if (typeof cmd === 'string') {
      (function () {
        var items = cmd.split(' ');
        command.file = items[0];
        command.args = items.slice(1);
      })();
    } else if (cmd instanceof Array) {
      command.file = cmd[0];
      command.args = cmd.slice(1);
    }
    if (args) {
      if (typeof args === 'string') {
        command.args = args.split(' ');
      } else if (args instanceof Array) {
        command.args = args.slice(0);
      } else if (typeof args === 'object') {
        command.options = args;
      }
    }
    if (options) {
      command.options = args;
    }
    stdout = '';
    stderr = '';
    child = childProcess.spawn(command.file, command.args, command.options);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.on('close', function (code) {
      callback(code ? { code: code, err: stderr } : null, stdout);
    });
    child.stdout.on('data', function (data) {
      stdout += data;
    });
    child.stderr.on('data', function (data) {
      stderr += data;
    });
  }
};

util.extend(util, require('util'));

module.exports = util;