QUnit.module('expected count failure in setup', {
  setup: function(assert) {
    assert.ok(true);
  }
});
test('normal', 1, function(assert) {
  assert.ok(true);
});
