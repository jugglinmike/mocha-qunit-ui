suite("QUnit Assertion Types Tests");
//Tests taken from the QUnit website's examples of each assertion type.

test( "deepEqual test", function() {
  var obj = { foo: "bar" };
  deepEqual( obj, { foo: "bar" }, "Two objects can be the same in value" );
});

test( "equal test", function() {
  equal( 1, "1", "String '1' and number 1 have the same value" );
});

test( "notDeepEqual test", function() {
  var obj = { foo: "bar" };
  notDeepEqual( obj, { foo: "bla" }, "Different object, same key, different value, not equal" );
});

test( "notEqual test", function() {
  notEqual( 1, "2", "String '2' and number 1 don't have the same value" );
});

test( "notStrictEqual test", function() {
  notStrictEqual( 1, "1", "String '1' and number 1 don't have the same value" );
});

test( "ok test", function() {
  ok( true, "true succeeds" );
  ok( "non-empty", "non-empty string succeeds" );
});

test( "strictEqual test", function() {
  strictEqual( 1, 1, "1 and 1 are the same value and type" );
});

var testThrows = function(assert) {
  return function() {
    function CustomError( message ) { this.message = message; }
    CustomError.prototype.toString = function() { return this.message; };

    assert(
      function() { throw "error" },
      "throws with just a message, no expected"
    );

    assert(
      function() { throw new CustomError; },
      CustomError,
      "raised error is an instance of CustomError"
    );

    assert(
      function() { throw new CustomError("some error description"); },
      /description/,
      "raised error message contains 'description'"
    );
  }
}

test("throws", testThrows(global.throws));
test("raises", testThrows(global.raises));

suite("Positive tests for expect");
test('expect succeeds', function (){
  expect(3);
  ok(true);
  ok(true);
  ok(true);
});

test('expect succeeds async', function (done){
  expect(2);
  ok(true);
  setTimeout(function (){
    ok(true);
    done();
  }, 20);
});

test('expect succeeds using arguments', 3, function (){
  ok(true);
  ok(true);
  ok(true);
});

test('expect succeeds async using arguments', 2, function (done){
  ok(true);
  setTimeout(function (){
    ok(true);
    done();
  }, 20);
});

suite("asyncTest method support");
asyncTest( "using asyncTest to start after a delay", function() {
  expect( 1 );
  setTimeout(function() {
    ok( true, "Passed and ready to resume!" );
    start();
  }, 1);
});

asyncTest( "using asyncTest with done parameter", function (done){
  expect(1);
  setTimeout(function() {
    ok( true, "Passed and ready to resume!" );
    done();
  }, 100);
});

test('using stop() then start() multiple times', function (){
  stop();
  expect(2);
  setTimeout(function() {
    ok(true);
    start();
    setTimeout(function() {
      ok(true);
      start();
    }, 0);
    stop();
  }, 0);
});

test('stacking stop() calls', function () {
  expect(0);
  stop();
  stop();
  start();
  start();
});
