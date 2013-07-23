
/**
 * Module dependencies.
 */


var Mocha;
if(module.parent){
  Mocha = module.parent.require("mocha");
}else{
  Mocha = window.Mocha;
}
var Suite = Mocha.Suite
  , Test = Mocha.Test
  , assert = require("assert");

/**
 * QUnit-style interface:
 * 
 *     suite('Array');
 *     
 *     test('#length', function(){
 *       var arr = [1,2,3];
 *       ok(arr.length == 3);
 *     });
 *     
 *     test('#indexOf()', function(){
 *       var arr = [1,2,3];
 *       ok(arr.indexOf(1) == 0);
 *       ok(arr.indexOf(2) == 1);
 *       ok(arr.indexOf(3) == 2);
 *     });
 *     
 *     suite('String');
 *     
 *     test('#length', function(){
 *       ok('foo'.length == 3);
 *     });
 * 
 */

module.exports = function(suite){
  var suites = [suite];

  var assertionCount;
  var expectedAssertions;
  var deferrals;
  var currentDoneFn;
  var checkingDeferrals;

  suite.on('pre-require', function(context){

    /**
     * Execute before running tests.
     */

    context.before = function(fn){
      suites[0].beforeAll(fn);
    };

    /**
     * Execute after running tests.
     */

    context.after = function(fn){
      suites[0].afterAll(fn);
    };

    /**
     * Execute before each test case.
     */

    context.beforeEach = function(fn){
      suites[0].beforeEach(fn);
    };

    /**
     * Execute after each test case.
     */

    context.afterEach = function(fn){
      suites[0].afterEach(fn);
    };

    /**
     * Describe a "suite" with the given `title`.
     */
  
    context.suite = function(title, opts){
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);

      if (opts) {
        suite.beforeEach(function() { for (var k in opts) this[k] = opts[k] });
        if (opts.setup) suite.beforeEach(opts.setup);
        if (opts.teardown) suite.afterEach(opts.teardown);
      }
    };

    /** 
    * Call this after each assertion to increment the assertion count 
    * (for custom assertion types)
    */
    context.afterAssertion = function (){
      assertionCount++;
    };

    /** The number of assertions to expect in the current test case */
    context.expect = function (n){
      expectedAssertions = n;
    };

    /** Define all of the QUnit Assertions based of their node.js equivalents */
    ["deepEqual", "equal", "notDeepEqual", "notEqual",
      "notStrictEqual","ok","strictEqual","throws"].forEach(function (k){
      context[k] = function (){
        assertionCount++;
        assert[k].apply(null, arguments);
      }
    });

    // Deprecated since QUnit v1.9.0, but still used, e.g. by Backbone.
    context.raises = context.throws

    /** 
    * Checks to see if the assertion counts indicate a failure.  
    * Returns an Error object if it did, null otherwise;
    */
    var checkAssertionCount = function (){
      if(expectedAssertions > 0 && expectedAssertions != assertionCount){
        return new Error("Expected "+ expectedAssertions + " assertions but saw " + assertionCount);
      };
      return null;
    };

    context.start = function (){
      deferrals--;
      if (deferrals === 0 && !checkingDeferrals) {
        checkingDeferrals = true;
        process.nextTick(function() {
          checkingDeferrals = false;
          if (deferrals === 0 && currentDoneFn) {
            currentDoneFn();
          }
        });
      } else if (deferrals < 0) {
        throw new Error("cannot call start() when not stopped");
      }
    };

    context.stop = function (){
      deferrals++;
    };

    function normalizeTestArgs(fn) {
      return function(title, expect, test) {
        if (typeof expect == "function") {
          test = expect;
          expect = 0;
        }

        return fn.call(this, title, expect, test);
      };
    }

    function wrapTestFunction(test, wrapper) {
      var result = function(done) {
        return wrapper.call(this, test, done);
      };
      result.toString = test.toString.bind(test);
      return result;
    }

    function addTest(title, expect, test) {
      suites[0].addTest(new Test(title, wrapTestFunction(test, function(test, done) {
        deferrals = 0;
        checkingDeferrals = false;
        expectedAssertions = expect;
        assertionCount = 0;
        currentDoneFn = function() {
          done(checkAssertionCount());
          currentDoneFn = null;
        };
        context.stop();
        test.call(this, currentDoneFn);
        context.start();
      })));
    }

    /**
     * Describe a specification or test-case
     * with the given `title`, an optional number of assertions to expect,
     * callback `test` acting as a thunk.
     */
    context.test = normalizeTestArgs(function(title, expect, test) {
      if (test.length) {
        // it takes an argument, assumed to be the done function, so it's really an async test
        context.asyncTest(title, expect, test);
      } else {
        addTest(title, expect, test);
      }
    });

    context.asyncTest = normalizeTestArgs(function(title, expect, test) {
      addTest(title, expect, wrapTestFunction(test, function(test, done) {
        context.stop();
        test.call(this, done);
      }));
    });

  });
};

Mocha.interfaces["qunit-mocha-ui"] = module.exports;
