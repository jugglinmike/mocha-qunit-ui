suite("Negative tests for expect");
test("run four negative expect() tests in a child process, should be 4 failures", function (done){
  expect(1);
  this.timeout(750);
  var cp = require('child_process');
  var n = cp.fork("./testrunner-child.js", {silent:true});
  n.on('message', function(numFailures) {
    equal(4, numFailures, "There should be 4 failed tests in the child testrunner.");
    done();
  });
  n.send({testfile:"./test/qunit-expect-negative-test.js"});
});