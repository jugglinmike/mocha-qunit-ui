var fs = require('fs');
var Mocha = require('mocha');
var testRegex = /\b(asyncTest|test)\b\s*\(/g;
require("../mocha-qunit-ui.js");

function run(fileName, done) {
  var mocha = new Mocha({
    ui: "qunit",
    // Use the "base" reporter so nothing is actually printed
    reporter: "base"
  });
  fs.readFile(fileName, function(err, buffer) {
    var testStatements = String(buffer).match(testRegex).length;
    mocha.addFile(fileName);
    mocha.run(function(failures) {
      if (testStatements !== failures) {
        done(1);
      } else {
        done(0);
      }
    });
  });
};

var failureCount = 0;
function runAll(fileNames, lastFailed) {
  failureCount += lastFailed || 0;
  if (!fileNames.length) {
    process.exit(failureCount);
  }
  run(fileNames.shift(), runAll.bind(null, fileNames));
}

runAll(process.argv.slice(2));
