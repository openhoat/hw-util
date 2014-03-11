var chai = require('chai')
  , expect = chai.expect
  , util = require('../lib/hw-util');

describe('loadConfig', function () {
  it('should return a configuration object based on configuration files', function () {
    var options
      , config;
    options = {
      configDir: 'config',
      defaultConfigName: 'default',
      depth: 1,
      baseDir: __dirname,
      defaultConfig: null
    };
    config = util.loadConfig(options);
    if (config.env === 'production') {
      expect(config).to.eql({
        a: 11,
        b: 2,
        c: { d: true, e: 'eee' },
        f: [ 1, 2, 3 ],
        g: './gpath',
        baseDir: __dirname,
        env: 'production'
      });
    } else {
      expect(config).to.eql({
        a: 11,
        b: 2,
        c: { d: true, e: 'ee' },
        f: [ 1, 2, 3 ],
        g: './gpath',
        baseDir: __dirname
      });
    }
  });
  it('should return a configuration object based on configuration files with complex object', function () {
    var defaultConfig = require('./config/default')
      , options
      , config;
    defaultConfig.stream = process.stdout;
    options = {
      configDir: 'config',
      defaultConfigName: 'default',
      depth: 1,
      baseDir: __dirname,
      defaultConfig: null
    };
    config = util.loadConfig(options);
    expect(config).to.be.ok;
    expect(config.a).to.equal(11);
    expect(config.b).to.equal(2);
    expect(config.c).to.eql({d: true, e: config.env === 'production' ? 'eee' : 'ee'});
    expect(config.f).to.eql([ 1, 2, 3 ]);
    expect(config.g).to.equal('./gpath');
    expect(config.baseDir).to.equal(__dirname);
    expect(config.baseDir).to.equal(__dirname);
  });
});