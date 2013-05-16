var Mocha = require('mocha');

//Override the built-in QUnit reporter
Mocha.interfaces["qunit-mocha-ui"] = require("./qunit-mocha-ui.js");
var mocha = new Mocha({ui:"qunit-mocha-ui", reporter:"spec"});
mocha.addFile("./test/qunit-test.js");
mocha.addFile("./test/suite-test.js");

mocha.run(function(failures){
  process.exit(failures);
});
