asyncTest('foo', function(assert) {
  setTimeout(function() {
    assert.ok(false);
    start();
  }, 1);
});

QUnit.asyncTest('foo', function(assert) {
  setTimeout(function() {
    assert.ok(false);
    start();
  }, 1);
});
