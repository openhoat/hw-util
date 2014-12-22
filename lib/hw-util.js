var util, log;

function extend(origin, add) {
  var keys, i;
  if (!add || typeof add !== 'object') {
    return origin;
  }
  keys = Object.keys(add);
  i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

util = extend({}, require('util'));
util.logFactory = require('./log-factory');
log = util.logFactory('util');

util.buildEffectiveConfig = function (cfg, defaultCfg) {
  var _ = require('lodash');
  return _.merge({}, defaultCfg, cfg);
};

util.unloadModule = function (modules) {
  var path = require('path')
    , callsite = require('callsite')
    , stack = callsite()
    , requester = stack[1].getFileName();
  modules = (arguments.length < 2 && !util.isArray(modules)) ? [modules] : Array.prototype.slice.call(arguments);
  modules.forEach(function (module) {
    var modulePath, m;
    modulePath = module.indexOf('.') === 0 ? modulePath = path.join(path.dirname(requester), module) : module;
    m = require.resolve(modulePath);
    delete require.cache[m];
  });
};

util.extend = extend;

util.getArgsCleaner = function (defaultCfg) {
  return function (opt, callback) {
    if (typeof opt === 'function') {
      callback = opt;
      opt = {};
    }
    callback = callback || util.noop;
    opt = opt || {};
    if (defaultCfg) {
      opt.config = util.buildEffectiveConfig(opt.config, defaultCfg);
    }
    return {opt: opt, cb: callback};
  };
};

util.getOrCall = function (o) {
  if (typeof o === 'function') {
    return o();
  } else {
    return o;
  }
};

util.getUserHome = function () {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

util.noop = function (err) {
  if (err) {
    throw err;
  }
};

util.optionCallbackArgParser = function (opt, cb) {
  var result = {
    opt: opt,
    cb: cb
  };
  if (arguments.length === 1 && typeof opt === 'function') {
    result.cb = opt;
    result.opt = {};
  }
  result.opt = result.opt || {};
  result.cb = result.cb || util.noop;
  return result;
};

util.Q = function () {
  var Q = require('q')
    , funcs, args, done, q;
  funcs = [];
  args = Array.prototype.slice.call(arguments);
  args.forEach(function (arg, index) {
    if (index < args.length - 1) {
      funcs.push(arg);
    } else {
      done = arg;
    }
  });
  q = Q();
  funcs.forEach(function (func) {
    q = q.then(function () {
      var args, next, deferred;
      args = Array.prototype.slice.call(arguments);
      while (args.length && args[0] === undefined) {
        args.splice(0, 1);
      }
      if (func.length) {
        deferred = Q.defer();
        next = {resolve: deferred.resolve, reject: deferred.reject, nodeResolver: deferred.makeNodeResolver()};
        args.push(next);
        func.apply(q, args);
        return deferred.promise;
      } else {
        return func.apply(q, args);
      }
    });
  });
  q.then(done).catch(done);
  return q;
};

util.reverse = function (s) {
  return s.split('').reverse().join('');
};

util.filterByProperty = function (property, expectedValue) {
  return function (item) {
    return expectedValue instanceof RegExp ? item[property].matches(expectedValue) : item[property] === expectedValue;
  };
};

util.fetchMailbox = function (opt, cb) {
  var Promise = require('bluebird')
    , Imap = require('imap')
    , args = util.optionCallbackArgParser.apply(null, arguments);
  //Promise.promisifyAll(Imap.prototype);
  opt = args.opt;
  cb = args.cb;
  log.trace('fetchMailbox options :', opt);
  return new Promise(function (resolve, reject) {
    var imap, matchingEmails;

    matchingEmails = [];
    imap = new Imap(opt.imap);

    function imapError(err) {
      log.trace('Error :', util.inspect(err));
      imap.end();
      reject(err);
    }

    function imapEnd() {
      log.trace('imap connection ended');
      resolve(matchingEmails);
    }

    function closeImap() {
      if (imap) {
        imap.end();
        imap = null;
      }
    }

    function imapReady() {
      Promise.promisify(imap.openBox).call(imap, 'INBOX', typeof opt.readonly === 'boolean' && opt.readonly)
        //imap.openBoxAsync('INBOX', typeof opt.readonly === 'boolean' && opt.readonly)
        .then(function (box) {
          var searchCriteria = [];
          console.log('box :', box);
          if (opt.criteria) {
            if (opt.criteria.unseen) {
              searchCriteria.push('UNSEEN');
            }
            if (opt.criteria.subject) {
              searchCriteria.push(['HEADER', 'SUBJECT', opt.criteria.subject]);
            }
            if (opt.criteria.from) {
              searchCriteria.push(['HEADER', 'FROM', opt.criteria.from]);
            }
          }
          log.trace('searchCriteria :', searchCriteria);
          if (searchCriteria.length) {
            return Promise.promisify(imap.search).call(imap, searchCriteria);
          }
        })
        .then(function (searchResult) {
          var fetch;
          log.trace('searchResult :', searchResult);
          if (searchResult.length) {
            fetch = imap.fetch(searchResult, {
              markSeen: !(typeof opt.markSeen === 'boolean' && opt.markSeen === false),
              bodies: ['HEADER.FIELDS (FROM SUBJECT)', 'TEXT']
            });
          }
          log.trace('fetch :', fetch);
          if (!fetch) {
            closeImap();
            return;
          }
          fetch.on('message', function (msg/*, seqno*/) {
            var header, from, subject, body, msgId;
            log.trace('msg :', msg);
            msg.on('body', function (stream, info) {
              var buffer;
              log.trace('message body event');
              buffer = '';
              stream.on('data', function (chunk) {
                log.trace('message stream data event');
                buffer += chunk.toString('utf8');
              });
              stream.once('end', function () {
                log.trace('message stream end event');
                if (info.which === 'TEXT') {
                  body = buffer;
                } else {
                  header = buffer.split('\r\n');
                  from = header[0].substring('From :'.length);
                  subject = header[1].substring('Subject :'.length);
                }
              });
            });
            msg.once('attributes', function (attrs) {
              msgId = attrs.uid;
              log.trace('message id :', msgId);
            });
            msg.once('end', function () {
              log.trace('message end event');
              matchingEmails.push({
                id: msgId,
                from: from,
                subject: subject,
                body: body
              });
            });
          });
          fetch.once('error', function (err) {
            log.error(err);
          });
          fetch.once('end', function () {
            log.info('all messages fetched');
            closeImap();
          });
        })
        .finally(closeImap)
        .catch(reject);
    }

    imap.once('ready', imapReady);
    imap.once('error', imapError);
    imap.once('end', imapEnd);
    imap.connect();
  }).nodeify(cb);
};

util.findInEmailBody = function (opt) {
  var matches, body;
  body = opt.body.split('=\r\n').join('');//.split('\r\n').join('');
  log.trace('checking body :', body);
  matches = body.match(new RegExp(opt.filter));
  log.trace('email body matches :', matches);
  return matches;
};

util.retryIfNoResult = function (opt) {
  var Promise = require('bluebird');
  opt = opt || {};
  if (typeof opt.try !== 'function') {
    throw new Error('Missing try function in options');
  }
  if (typeof opt.check !== 'function') {
    throw new Error('Missing check function in options');
  }
  return (function tryTo() {
    return opt.try()
      .then(function (result) {
        var matches, promise;
        matches = opt.check(result);
        if (matches) {
          return matches;
        }
        log.trace('result does not match, try again%s', opt.wait ? util.format(' (waiting %sms)', opt.wait) : '');
        promise = opt.wait ? Promise.delay(opt.wait) : Promise.resolve();
        return promise.then(function () {
          return tryTo();
        });
      });
  })();
};

util.hookStdout = function (cb) {
  var origWrite = process.stdout.write;
  process.stdout.write = cb;
  return function () {
    process.stdout.write = origWrite;
  };
};

util.hookStderr = function (cb) {
  var origWrite = process.stderr.write;
  process.stderr.write = cb;
  return function () {
    process.stderr.write = origWrite;
  };
};

exports = module.exports = util;