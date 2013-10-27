module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jasmine_node: {
      specNameMatcher: 'spec',
      projectRoot: '.',
      requirejs: false,
      forceExit: true,
      jUnit: {
        report: false,
        savePath: 'build/reports/jasmine/',
        useDotNotation: true,
        consolidate: true
      }
    }
  });
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.registerTask('default', ['jasmine_node']);
};