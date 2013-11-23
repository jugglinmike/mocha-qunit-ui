module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.initConfig({
    concat: {
      'mocha-qunit-ui.js': [
        'lib/head.js',
        'lib/qunit-head.jslike',
        'qunit/qunit/qunit.js',
        'lib/qunit-tail.jslike',
        'lib/ui-head.jslike',
        'lib/mocha-qunit-ui.js',
        'lib/ui-tail.jslike',
        'lib/tail.js'
      ]
    },
    mocha: {
      test: {
        options: {
          run: true
        },
        src: ['test/jquery.html']
      }
    },
    mochaTest: {
      options: {
        reporter: 'dot',
        ui: 'tdd'
      },
      src: 'test/expected-failures.js'
    }
  });

  grunt.registerTask('build', ['concat']);
  grunt.registerTask('test', ['build', 'mochaTest', 'mocha']);
  grunt.registerTask('default', ['test']);
};
