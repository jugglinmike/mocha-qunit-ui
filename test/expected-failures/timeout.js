QUnit.config.testTimeout = 100;

test('Global timeout', function(assert) {
  stop();
  setTimeout(function() {
    assert.ok(true);
    start();
  }, 200);
});
