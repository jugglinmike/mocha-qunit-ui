module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.initConfig({
    concat: {
      'mocha-qunit-ui.js': [
        'src/head.js',
        'src/qunit-head.jslike',
        'qunit/qunit/qunit.js',
        'src/qunit-tail.jslike',
        'src/ui-head.jslike',
        'src/mocha-qunit-ui.js',
        'src/ui-tail.jslike',
        'src/tail.js'
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
