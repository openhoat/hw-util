var chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , util = require('../lib/hw-util');
//  , log = util.logFactory('hwUtilSpec');

describe('util', function () {

  function f() {
    return 'f';
  }

  describe('extends native util module', function () {
    it('should respond to util functions', function () {
      var fns = ['format', 'debug', 'error', 'puts', 'print', 'log', 'inspect', 'isArray', 'isRegExp', 'isDate', 'isError', 'pump', 'inherits'];
      fns.forEach(function (fn) {
        util.should.respondTo(fn);
      });
    });
  });

  describe('unloadModule', function () {
    it('should unload node module', function () {
      var m, moduleName = 'bluebird';
      m = require(moduleName);
      m.hello = 'world';
      util.unloadModule(moduleName);
      expect(m).to.have.property('hello', 'world');
      m = require(moduleName);
      expect(m).to.not.have.property('hello');
    });
  });

  describe('getArgsCleaner', function () {
    //TODO
  });

  describe('getOrCall', function () {
    //TODO
  });

  describe('getUserHome', function () {
    //TODO
  });

  describe('noop', function () {
    //TODO
  });

  describe('optionCallbackArgParser', function () {
    //TODO
  });

  describe('Q', function () {
    //TODO
  });

  describe('reverse', function () {
    it('should return reverse string', function () {
      expect(util.reverse('abcdefgh')).to.equal('hgfedcba');
      expect(util.reverse(util.reverse('abcdefgh'))).to.equal('abcdefgh');
    });
  });

  describe('filterByProperty', function () {
    //TODO
  });

  describe('hookStdout, hookStderr', function () {

    function redirectStd(stderr, msg) {
      var dest, std, restoreStd, result;
      dest = stderr ? 'stderr' : 'stdout';
      result = '';
      std = function (s/*, encoding, fd*/) {
        result += s;
      };
      process[dest].write(msg);
      restoreStd = stderr ? util.hookStderr(std) : util.hookStdout(std);
      process[dest].write(msg);
      restoreStd();
      process[dest].write(msg);
      result.should.equal(msg);
    }

    it('should redirect stdout', function () {
      redirectStd(false, 'hello stdout');
    });
    it('should redirect stderr', function () {
      redirectStd(true, 'hello stderr');
    });
  });

  describe('extend', function () {
    it('should extend object', function () {
      var orig, add, result;
      orig = {
        a: 3, b: 'b',
        c: {d: 5, e: 'e'},
        f: f
      };
      add = {g: 'g'};
      result = util.extend(orig, add);
      should.exist(result);
      result.should.deep.equal({
        a: 3, b: 'b',
        c: {d: 5, e: 'e'},
        f: f, g: 'g'
      });
    });
  });

  describe('buildEffectiveConfig', function () {
    it('should return built config object', function () {
      var cfg, defaultCfg, result;
      defaultCfg = {
        a: 3, b: 'b',
        c: {d: 5, e: 'e'},
        f: f
      };
      cfg = {
        b: 'bb',
        c: {e: 'ee'},
        g: 'g'
      };
      result = util.buildEffectiveConfig(cfg, defaultCfg);
      should.exist(result);
      result.should.deep.equal({
        a: 3, b: 'bb',
        c: {d: 5, e: 'ee'},
        f: f, g: 'g'
      });
    });
  });

  xdescribe('fetchMailbox', function () {
    it('should fetch mailbox', function (done) { // A utiliser ponctuelement pour tester le polling imap
      var opt = {
        imap: {
          host: 'imap.laposte.io',
          port: 143,
          tls: false,
          user: 'digiposte',
          password: 'Xiwg3WXcQf1Kb1',
          authTimeout: 20000
        }, criteria: {
          unseen: true,
          from: 'no-reply@fullsix.com',
          subject: "Activation d'une nouvelle adresse e-mail",
          linkFilter: '"([\\w:/\\.-]+\/utilisateur\/activation[\\w:/\\.]+)"'
        }
      };
      util
        .retryIfNoResult({
          try: function () {
            return util.fetchMailbox(opt);
          },
          check: function (emails) {
            var i, email, matches;
            console.log('emails :', emails);
            for (i = 0; !matches && i < emails.length; i++) {
              email = emails[i];
              matches = util.findInEmailBody({
                body: email.body,
                filter: '(")([\\w:/\\.-]+\/utilisateur\/activation[\\w:/\\.]+)(")'
              });
            }
            console.log('matches :', matches);
            return matches[2];
          },
          wait: 1000
        })
        .then(function (/*link*/) {
          // TODO
          console.log('args :', arguments);
        })
        .then(done, done);
    });
  });
});