(function(global, undefined) {
"use strict";

var Mocha = global.Mocha;
var Suite = Mocha.Suite;
var Test = Mocha.Test;

var assertFns = {
  ok: function(val) {
    if (!val) {
      throw new Error("Expected " + val + " to be truthy");
    }
  },
  equal: function(val1, val2) {
    if (val1 != val2) {
      throw new Error("Expected " + val1 + " to equal " + val2);
    }
  },
  notStrictEqual: function(val1, val2) {
    if (val1 !== val2) {
      throw new Error("Expected " + val1 + " to strictly equal " + val2);
    }
  }
};

/**
 * QUnit-style interface:
 *
 *     module('Array');
 *
 *     test('#length', function() {
 *       var arr = [1,2,3];
 *       ok(arr.length == 3);
 *     });
 *
 *     test('#indexOf()', function() {
 *       var arr = [1,2,3];
 *       ok(arr.indexOf(1) == 0);
 *       ok(arr.indexOf(2) == 1);
 *       ok(arr.indexOf(3) == 2);
 *     });
 *
 *     suite('String');
 *
 *     test('#length', function() {
 *       ok('foo'.length == 3);
 *     });
 *
 */

var ui = function(suite) {
  var suites = [suite];

  var assertionCount = 0;
  var inModule = false;
  var expectedAssertions;
  var deferrals = 0;
  var currentDoneFn;
  var checkingDeferrals;

  suite.on('pre-require', function(realContext) {

    /**
     * Execute before running tests.
     */
    var context = {};
    var assert = {};

    /**
     * Describe a "suite" with the given `title`.
     */

    context.module = function(title, opts) {
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);

      suite.beforeEach(function() {
        checkingDeferrals = false;
        deferrals = 0;
        inModule = true;
        assertionCount = 0;
      });
      if (opts) {
        suite.beforeEach(function() { for (var k in opts) this[k] = opts[k] });
        if (opts.setup) suite.beforeEach(opts.setup.bind(this, assert));
        if (opts.teardown) suite.afterEach(opts.teardown.bind(this, assert));
      }
      suite.afterEach(function(done) {
        done(checkAssertionCount());
      });
    };

    /**
    * Call this after each assertion to increment the assertion count
    * (for custom assertion types)
    */
    context.afterAssertion = function() {
      assertionCount++;
    };

    /** The number of assertions to expect in the current test case */
    context.expect = function(n) {
      if (!arguments.length) {
        return expectedAssertions;
      }
      expectedAssertions = n;
    };

    /** Define all of the QUnit Assertions based of their node.js equivalents */
    ["deepEqual", "equal", "notDeepEqual", "notEqual",
      "notStrictEqual","ok","strictEqual","throws"].forEach(function(k) {
      assert[k] = function() {
        assertionCount++;
        assertFns[k].apply(null, arguments);
      }
    });

    // Deprecated since QUnit v1.9.0, but still used, e.g. by Backbone.
    context.raises = context.throws

    /**
    * Checks to see if the assertion counts indicate a failure.
    * Returns an Error object if it did, null otherwise;
    */
    var checkAssertionCount = function() {
      if(expectedAssertions > 0 && expectedAssertions != assertionCount){
        return new Error("Expected "+ expectedAssertions + " assertions but saw " + assertionCount);
      };
      return null;
    };

    context.start = function(count) {
      count = count || 1;
      deferrals -= count;
      if (deferrals === 0 && !checkingDeferrals) {
        checkingDeferrals = true;
        setTimeout(function() {
          checkingDeferrals = false;
          if (deferrals === 0 && currentDoneFn) {
            currentDoneFn();
          }
        }, 0);
      } else if (deferrals < 0) {
        throw new Error("cannot call start() when not stopped");
      }
    };

    context.stop = function(count) {
      count = count || 1;
      deferrals += count;
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
        expectedAssertions = expect;
        if (!inModule) {
          assertionCount = 0;
        }
        currentDoneFn = done;
        context.stop();
        test.call(this);
        context.start();
      })));
    }

    /**
     * Describe a specification or test-case
     * with the given `title`, an optional number of assertions to expect,
     * callback `test` acting as a thunk.
     */
    context.test = normalizeTestArgs(function(title, expect, test) {
      addTest(title, expect, test.bind(this, assert));
    });

    context.asyncTest = normalizeTestArgs(function(title, expect, test) {
      addTest(title, expect, wrapTestFunction(test, function(test, done) {
        context.stop();
        test.call(this, assert);
      }));
    });

    context.assert = assert;
    realContext.QUnit = context;
    Object.keys(assert).forEach(function(attr) {
      context[attr] = assert[attr];
    });
    Object.keys(context).forEach(function(attr) {
      realContext[attr] = context[attr];
    });
  });
};

Mocha.interfaces.qunit = ui;
if (typeof module !== "undefined") {
  module.exports = ui;
}
}(this));
