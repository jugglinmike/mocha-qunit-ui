test('array', function(assert) {
  assert.deepEqual([1, 2, 3], [1, 2, 4]);
});
test('object', function(assert) {
  assert.deepEqual({ a: 1, b: { c: 3 } }, { a: 1, b: { c: 4 } });
});
