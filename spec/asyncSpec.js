var chai = require('chai')
  , path = require('path')
  , fs = require('fs')
  , Promise = require('bluebird')
  , expect = chai.expect;

describe('async examples with #bluebird', function () {
  var readdirAsync = Promise.promisify(fs.readdir)
    , readFileAsync = Promise.promisify(fs.readFile)
    , statAsync = Promise.promisify(fs.stat);

  it('should find this file in current directory', function (done) {
    readdirAsync(__dirname)
      .then(function (files) {
        expect(files).to.include(path.basename(__filename));
      })
      .then(done, done);
  });
  it('should throw an error trying to read a bad directory', function (done) {
    readdirAsync(path.join(__dirname, 'bad'))
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err).to.ownProperty('cause');
        expect(err.cause).to.ownProperty('code');
        expect(err.cause.code).to.equal('ENOENT');
        done();
      });
  });

  describe('recursive search', function () {

    function readDir(dir) {
      return readdirAsync(dir)
        .filter(function (file) {
          return !(file.match(/^\./) || file === 'node_modules');
        })
        .map(function (file) {
          var subDir = path.join(dir, file);
          return statAsync(subDir)
            .then(function (stat) {
              return stat.isDirectory() ? readDir(subDir) : subDir;
            });
        })
        .reduce(function (files, file) {
          return files.concat(file);
        }, []);
    }

    it('should read recursively directory', function (done) {
      readDir(path.join(__dirname, '..'))
        .then(function (files) {
          expect(files).to.be.ok;
          expect(files.length).to.be.ok;
          expect(files).to.include(__filename);
          done();
        });
    });
  });

  it('should join promises', function (done) { // Exemple de join
    Promise.join(
      readFileAsync(__filename, 'utf8'),
      readFileAsync(path.join(__dirname, 'logFactorySpec.js'), 'utf8'),
      function (asyncSpecContent, helpersSpecContent) {
        return [asyncSpecContent.length, helpersSpecContent.length];
      })
      .spread(function (l1, l2) {
        expect(l1).to.equal(2296);
        expect(l2).to.equal(1280);
      })
      .then(done, done);
  });

});