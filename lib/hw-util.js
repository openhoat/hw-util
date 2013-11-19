var util = require('util')
  , that;

that = {
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
  compileConfig: function (config) {
    var configEnv = config.env || 'development';
    if (config.envs && config.envs[configEnv]) {
      that.copyProperties(config.envs[configEnv], config, false, ['envs']);
    }
    delete config.envs;
  },
  configToAbsolutePaths: function (config, baseDir) {
    var json = JSON.stringify(config);
    config = JSON.parse(json.replace(/"\.\//g, that.format('"%s/', baseDir)));
    return config;
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
            that.copyProperties(src[key], dest[key], onlyExisting);
          }
        } else {
          dest[key] = src[key];
        }
      }
    }
    return dest;
  },
  elapsedTime: function (start, unit) {
    var elapsed, q;
    q = eval('1E' + unit);
    elapsed = process.hrtime(start);
    return parseInt(elapsed[0] * q + elapsed[1] / (1E9 / q), 10);
  },
  elapsedTimeMs: function (start) {
    return that.elapsedTime(start, 3);
  },
  elapsedTimeMicros: function (start) {
    return that.elapsedTime(start, 6);
  },
  elapsedTimeNs: function (start) {
    return that.elapsedTime(start, 9);
  },
  elapsedTimeSec: function (start) {
    return that.elapsedTime(start, 0);
  },
  encodeBase36: function (n) {
    return n.toString(36);
  },
  decodeBase36: function (s) {
    return parseInt(s, 36);
  },
  escapePath: function (path) {
    var result = encodeURIComponent(path)
      .replace(/%2F/g, '/')
      .replace(/\)/g, '%29')
      .replace(/\(/g, '%28');
    if (result[0] === '/') {
      result = result.slice(1);
    }
    return result;
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
    callback = that.safeCallback(callback);
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
  generateRandomString: function (length, filter) {
    filter = filter || 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.apply(null, new Array(length)).map(function () {
      return filter[Math.floor(Math.random() * filter.length)];
    }).join('');
  },
  getCaller: function (depth) {
    var stack, caller;
    stack = that.getStack();
    stack.shift();
    stack.shift();
    if (depth) {
      (function () {
        for (var i = 0; i < depth; i++) {
          stack.shift();
        }
      })();
    }
    caller = stack[1].receiver;
    return caller;
  },
  getCallerPath: function (depth) {
    var path = require('path')
      , caller;
    caller = that.getCaller(depth || 1);
    return path.dirname(caller.filename);
  },
  getHostnameFromRequest: function (req) {
    var hostInfos, hostname;
    hostInfos = req.headers['host'].split(':');
    hostname = hostInfos[0];
    return hostname;
  },
  getStack: function () {
    var origPrepareStackTrace, err, stack;
    origPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    err = new Error();
    stack = err.stack;
    Error.prepareStackTrace = origPrepareStackTrace;
    stack.shift();
    return stack
  },
  hackArgs: function (o, methodName, callback) {
    var origMethod = o[methodName];
    callback = that.safeCallback(callback);
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
  isEnabled: function (o, propNames) {
    if (propNames) {
      return (function () {
        var i, result, propName;
        result = {};
        for (i = 0; i < propNames.length; i++) {
          propName = propNames[i];
          result[propName] = that.isEnabled(o[propName]);
        }
        return result;
      })();
    }
    return (o && (typeof o === 'boolean' || o['enabled'])) || false;
  },
  loadConfig: function (configDir, defaultConfigName, depth, baseDir, defaultConfig) {
    var path = require('path')
      , fs = require('fs')
      , baseDir, config, configAbsDir, files, configFileBasename, configFileExtname;
    defaultConfigName = defaultConfigName || 'default';
    configDir = configDir || 'config';
    baseDir = baseDir || that.getCallerPath(depth);
    configAbsDir = path.join(baseDir, configDir);
    config = defaultConfig;
    try {
      if (config) {
        util.copyProperties(require(path.join(configAbsDir, defaultConfigName)), config);
      } else {
        config = require(path.join(configAbsDir, defaultConfigName));
      }
    } catch (err) {
      config = {};
    }
    config.baseDir = baseDir;
    config.envs = {};
    files = fs.readdirSync(configAbsDir);
    files.forEach(function (file) {
      configFileExtname = path.extname(file);
      if (configFileExtname !== '.json' && configFileExtname !== '.js') {
        return;
      }
      configFileBasename = path.basename(file, configFileExtname);
      if (configFileBasename === defaultConfigName) {
        return;
      }
      config.envs[path.basename(file, path.extname(file))] = require(path.join(configAbsDir, file));
    });
    if (process.env['NODE_ENV']) {
      config.env = process.env['NODE_ENV'];
    }
    that.compileConfig(config);
    return config;
  },
  noop: function () {
  },
  now: function () {
    return process.hrtime();
  },
  parseArgs: function (args, specs) {
    var argsArray, result, spec, i, arg, j;

    function argMatches(arg, spec) {
      return arg === null||(!spec.objectType && typeof arg === spec.type) ||
        (spec.objectType && typeof arg === 'object' &&
          arg instanceof spec.objectType);
    }

    argsArray = Array.prototype.slice.apply(args);
    result = {};
    i = j = 0;
    while (i < specs.length) {
      spec = specs[i];
      arg = argsArray[j];
      if (argMatches(arg, spec)) {
        result[spec.name] = arg;
        i++;
        j++;
      } else {
        if (spec.optional) {
          i++;
        } else {
          if (i > 0 && j > 0) {
            (function () {
              var k;
              for (k = i - 1; k >= 0; k--) {
                if (specs[k].optional) {
                  if (argMatches(argsArray[j - 1], specs[k])) {
                    delete result[specs[k].name];
                    result[spec.name] = argsArray[j - 1];
                    i++;
                    break;
                  }
                } else {
                  j++;
                  break;
                }
              }
            })();
          }
          if (j >= argsArray.length) {
            break;
          }
        }
      }
    }
    for (i = 0; i < specs.length; i++) {
      spec = specs[i];
      result[spec.name] = result[spec.name] || spec.defaultValue;
    }
    return result;
  },
  requireIfModule: function (o) {
    return typeof o === 'string' ? require(o) : o;
  },
  reverse: function (str) {
    return str.split('').reduce(function (a, b) {
      return b + a
    }, '');
  },
  safeCallback: function (callback) {
    return callback || that.noop;
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
  toArrayBuffer: function (buffer) {
    var ab, view, i;
    ab = new ArrayBuffer(buffer.length);
    view = new Uint8Array(ab);
    for (i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return ab;
  }
};

that.extend(that, util);

module.exports = that;