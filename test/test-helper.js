var cp = require('child_process');

global.runTestFile = function(testfile, callback) {
  var n = cp.fork("./testrunner-child.js", {silent:true});
  n.on('message', callback);
  n.send({testfile: testfile});
};
