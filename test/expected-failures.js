var fs = require('fs');
var assert = require('assert');

var Mocha = require('mocha');
var testRegex = /\b(asyncTest|test)\b\s*\(/g;

suite('expected failures', function() {

  var testFiles = fs.readdirSync(__dirname + '/expected-failures')
    .filter(function(fileName) {
      return /\.js$/i.test(fileName);
    })
    .map(function(fileName) {
      return {
        prettyName: fileName
          .replace(/\-/g, ' ')
          .replace(/\.js$/i, ''),
        fullPath: __dirname + '/expected-failures/' + fileName
      };
    });

  test('more than one file', function() {
    assert.ok(testFiles.length > 0);
  });

  testFiles.forEach(function(testFile) {
    test(testFile.prettyName, function(done) {
      var mocha = new Mocha({
        ui: '../../../mocha-qunit-ui',
        // Use the "base" reporter so nothing is actually printed
        reporter: 'base'
      });

      fs.readFile(testFile.fullPath, function(err, buffer) {
        var testStatements = String(buffer).match(testRegex).length;
        mocha.addFile(testFile.fullPath);
        mocha.run(function(failures) {
          assert.equal(testStatements, failures);
          done();
        });
      });
    });
  });
});
