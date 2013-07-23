suite("Negative tests for async");
test("run negative async tests in a child process, should be 1 failure", function (){
  expect(1);
  runTestFile("./test/qunit-async-negative-test.js", function(numFailures) {
    equal(1, numFailures, "There should be 1 failed test in the child testrunner.");
    start();
  });
  stop();
});
