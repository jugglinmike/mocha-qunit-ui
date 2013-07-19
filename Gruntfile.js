module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      "qunit-mocha-ui-browser.js": ["qunit-mocha-ui.js"],
      options:{
        standalone:"qunitMochaUI"
      }
    },
    mochaTest: {
      test:{
        options:{reporter:"spec", require:__dirname +"/qunit-mocha-ui", ui:"qunit-mocha-ui"},
        src:["test/qunit-test.js", "test/qunit-expect-test.js", "test/suite-test.js"]
      }
    }
  });
  grunt.registerTask('default', ['browserify', 'mochaTest']);
};