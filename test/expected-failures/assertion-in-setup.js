QUnit.module('assertion failure in setup', {
  setup: function(assert) {
    assert.ok(false);
  }
});
test('normal', function(assert) {
  assert.ok(true);
});
