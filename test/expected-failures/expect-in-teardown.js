QUnit.module('expected count failure in teardown', {
  teardown: function(assert) {
    assert.ok(true);
  }
});
test('normal', 1, function(assert) {
  assert.ok(true);
});
