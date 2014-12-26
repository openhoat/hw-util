module.exports = function (grunt) {
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      default: ['dist']
    },
    mkdir: {
      all: {
        options: {
          create: ['dist/reports']
        }
      }
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        force: true,
        jshintrc: 'jshint.json'
      },
      src: [
        'lib/**/*.js',
        'spec/**/*.js'
      ]
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['spec/**/*Spec.js']
      }
    },
    exec: {
      coverage: {
        command: './node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- --ui bdd -R spec -t 5000 spec/**/*.js'
      }
    }
  };
  if (grunt.option('ci')) {
    gruntConfig.jshint.options.reporter = 'checkstyle';
    gruntConfig.jshint.options.reporterOutput = 'dist/reports/jshint_checkstyle.xml';
    gruntConfig.mochaTest.test.options.reporter = 'xunit-file';
    gruntConfig.mochaTest.test.options.quiet = true;
    process.env.XUNIT_FILE = 'dist/reports/xunit.xml';
  }
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  grunt.initConfig(gruntConfig);
  grunt.registerTask('verify', ['mkdir', 'jshint']);
  grunt.registerTask('test', ['mkdir', 'mochaTest']);
  grunt.registerTask('cover', ['mkdir', 'exec:coverage']);
  grunt.registerTask('default', ['verify', 'test']);
};