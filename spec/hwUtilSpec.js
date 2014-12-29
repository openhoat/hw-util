var path = require('path')
  , chai = require('chai')
  , expect = chai.expect
  , should = chai.should()
  , util = require('../lib/hw-util');
  // , log = util.logFactory('hwUtilSpec');

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

  xdescribe('sendMail', function () {

    this.timeout(10000);

    it('should send an email', function () {
      var options = {
        transport: {
          host: process.env.HW_UTIL_SMTP_HOST,
          port: 25,
          secure: false,
          auth: {
            user: process.env.HW_UTIL_SMTP_USER,
            pass: process.env.HW_UTIL_SMTP_PASSWORD
          },
          authMethod: 'PLAIN',
          ignoreTLS: true,
          // localAddress ,
          // connectionTimeout,
          // greetingTimeout,
          // socketTimeout,
          // tls,
          // debug
          name: 'webbot'
        },
        mail: {
          from: process.env.HW_UTIL_MAIL_FROM,
          to: process.env.HW_UTIL_MAIL_TO,
          subject: 'Hello',
          text: 'Hello world',
          html: '<b>Hello world</b>',
          attachments: [ // https://github.com/andris9/Nodemailer#attachments
            {   // utf-8 string as an attachment
              filename: 'hello.txt',
              path: path.join(__dirname, 'hello.txt')
            }
          ]
        }
      };
      return util.sendMail(options)
        .then(function (info) {
          expect(info).to.be.ok;
          expect(info).to.have.property('accepted');
          info.accepted.should.be.an.array;//[process.env.HW_UTIL_MAIL_TO]);
          expect(info).to.have.property('rejected');
          info.rejected.should.be.an.array;
          info.rejected.should.be.empty;
          expect(info).to.have.property('response');
          expect(info).to.have.property('envelope');
          expect(info.envelope).to.have.property('from');
          info.envelope.from.should.be.an.array;
          expect(info.envelope).to.have.property('to');
          info.envelope.to.should.be.an.array;
          info.envelope.to.should.have.length(1);
          info.envelope.to[0].should.equal(process.env.HW_UTIL_MAIL_TO);
          expect(info).to.have.property('messageId');
        });
    });
  });

  xdescribe('uploadFtp', function () {

    this.timeout(10000);

    it('should send a file via ftp', function () {
      var options = {
        server: {
          host: process.env.HW_UTIL_FTP_HOST,
          port: process.env.HW_UTIL_FTP_PORT || 21,
          secure: false,
          secureOptions: null,
          // connTimeout,
          // pasvTimeout,
          // keepalive,
          user: process.env.HW_UTIL_FTP_USER,
          password: process.env.HW_UTIL_FTP_PASSWORD
        },
        file: {
          input: path.join(__dirname, 'hello.txt'),
          destPath: 'hello.txt'
        }
      };
      return util.uploadFtp(options);
    });
  });

  describe('simple http server', function () {
    var serverPort = 3999, testHttpServer;

    before(function () {
      return util
        .startHttpServer({port: serverPort})
        .then(function (httpServer) {
          testHttpServer = httpServer;
        });
    });

    after(function (done) {
      util
        .stopHttpServer({httpServer: testHttpServer})
        .then(done, done);
    });

    it('should get an echo web page', function (done) {
      var http = require('http');
      http.get(util.format('http://localhost:%s/hello', serverPort), function (res) {
        var body = '';
        expect(res).to.be.ok;
        expect(res).to.have.property('statusCode', 200);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          body += body + chunk;
        });
        res.on('end', function () {
          expect(body).to.equal(util.format('<html><head><title>Http Server</title></head><body><h1>Path</h1><h2>%s</h2></body></html>', '/hello'));
          done();
        });
      }).on('error', function (err) {
        done(err);
      });
    });
  });

});