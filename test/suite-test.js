suite("Suite with setup", {setup: function() { this.setup = true }})

test("calls the setup function before the first test", function() {
  ok(this.setup)
})

test("calls the setup function before the second test", function() {
  ok(this.setup)
})

var tearedDown
suite("Suite with teardown", {teardown: function() { tearedDown = true }})

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
