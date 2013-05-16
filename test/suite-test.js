suite("Suite given setup", {setup: function() { this.setup = true }})

test("calls the setup function before the first test", function() {
  ok(this.setup)
})

test("calls the setup function before the second test", function() {
  ok(this.setup)
})

var tearedDown
suite("Suite given teardown", {teardown: function() { tearedDown = true }})

test("does not call the teardown function before the first test", function() {
  ok(!tearedDown)
})

test("calls the teardown function after the first test", function() {
  ok(tearedDown)
  tearedDown = false
})

test("calls the teardown function after the second test", function() {
  ok(tearedDown)
})

suite("Suite given an environment", {foo: 42})
test("extends the current context with the given object", function() {
  ok(this.foo === 42)
})
