QUnit.module('assertion failure in teardown', {
  teardown: function(assert) {
    assert.ok(false);
  }
});
test('normal', function(assert) {
  assert.ok(true);
});
