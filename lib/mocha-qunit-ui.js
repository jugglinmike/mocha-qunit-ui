var Mocha = global.Mocha;
var Suite = Mocha.Suite;
var Test = Mocha.Test;
var QUnit = global.QUnit;
var assert = QUnit.assert;

var ui = function(suite) {
  var suites = [suite];

  var inModule = false;
  var expectedAssertions;
  var deferrals = 0;
  var currentDoneFn;
  var checkingDeferrals;

  function setContext(context) {
    QUnit.config.current = {
      testEnvironment: context,
      assertions: []
    };
    QUnit.current_testEnvironment = context;
  }

  // Ensure that all the assertions declared in the current context have
  // passed. This behavior differs somewhat from Mocha because (like QUnit)
  // more than one assertion may fail in a given test. Mocha can only report
  // one failure per test, so report the first failure.
  function checkAssertions() {
    try {
      QUnit.config.current.assertions.forEach(function(assertion) {
        if (!assertion.result) {
          throw new Error(assertion.message);
        }
      });
    } catch(err) {
      return err;
    }
  }

  suite.on('pre-require', function(context) {

    /**
     * Describe a "suite" with the given `title`.
     */

    context.module = function(title, opts) {
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);
      var originalFixture = document.getElementById("qunit-fixture").innerHTML;

      suite.beforeEach(function() {
        checkingDeferrals = false;
        document.getElementById("qunit-fixture").innerHTML = originalFixture;
        deferrals = 0;
        inModule = true;
        setContext(this);
      });

      if (opts) {
        suite.beforeEach(function() { for (var k in opts) this[k] = opts[k] });
        if (opts.setup) {
          suite.beforeEach(function(done) {
            stop();
            currentDoneFn = done;
            opts.setup.call(this, assert);
            start();
          });
        }
        if (opts.teardown) {
          suite.afterEach(function(done) {
            stop();
            currentDoneFn = done;
            opts.teardown.call(this, assert);
            start();
          });
        }
      }
      suite.afterEach(function(done) {
        done(checkAssertionCount());
      });
    };

    /** The number of assertions to expect in the current test case */
    context.expect = function(n) {
      if (!arguments.length) {
        return expectedAssertions;
      }
      expectedAssertions = n;
    };

    // Deprecated since QUnit v1.9.0, but still used, e.g. by Backbone.
    assert.raises = assert.throws

    /**
    * Checks to see if the assertion counts indicate a failure.
    * Returns an Error object if it did, null otherwise;
    */
    var checkAssertionCount = function() {
      var actualCount = QUnit.config.current.assertions.length;
      if(expectedAssertions > 0 && expectedAssertions != actualCount) {
        return new Error("Expected "+ expectedAssertions +
          " assertions but saw " + actualCount);
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
            currentDoneFn(checkAssertions());
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
        currentDoneFn = done;
        context.stop();
        if (!inModule) {
          setContext(this);
        }
        test.call(this, assert);
        context.start();
      })));
    }

    /**
     * Describe a specification or test-case
     * with the given `title`, an optional number of assertions to expect,
     * callback `test` acting as a thunk.
     */
    context.test = normalizeTestArgs(function(title, expect, test) {
      addTest(title, expect, test);
    });

    context.asyncTest = normalizeTestArgs(function(title, expect, test) {
      addTest(title, expect, wrapTestFunction(test, function(test, done) {
        context.stop();
        test.call(this, assert);
      }));
    });

  });
};

Mocha.interfaces.qunit = ui;
if (typeof module !== "undefined") {
  module.exports = ui;
}
