suite("Negative tests for expect");
test("run four negative expect() tests in a child process, should be 4 failures", function (){
  expect(1);
  this.timeout(750);
  runTestFile("./test/qunit-expect-negative-test.js", function(numFailures) {
    equal(4, numFailures, "There should be 4 failed tests in the child testrunner.");
    start();
  });
  stop();
});
