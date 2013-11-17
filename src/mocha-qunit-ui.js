var isBrowser = 'document' in global;
var Mocha = isBrowser ? global.Mocha : require('mocha');
var Suite = Mocha.Suite;
var Test = Mocha.Test;
var QUnit = global.QUnit;
var assert = QUnit.assert;
var config = QUnit.config;

var ui = function(suite) {
  var suites = [suite];

  var inModule = false;
  var firstTest = true;
  var expectedAssertions;
  var deferrals = 0;
  var currentDoneFn;
  var checkingDeferrals;

  function setContext(context) {
    config.current = {
      testEnvironment: context,
      // QUnit appends to this array when an assertion runs
      assertions: [],
      // The QUnit Mocha UI maintains a separate assertion array in order to
      // log assertion results with HTML-free messages
      _assertions: []
    };
    QUnit.current_testEnvironment = context;
  }

  // Ensure that all the assertions declared in the current context have
  // passed. This behavior differs somewhat from Mocha because (like QUnit)
  // more than one assertion may fail in a given test. Mocha can only report
  // one failure per test, so generate a single JavaScript Error object by
  // concatenating the messages from each QUnit error.
  function checkAssertions() {
    var msgs = [];
    config.current._assertions.forEach(function(assertion) {
      if (!assertion.result) {
        msgs.push(assertion.message);
      }
    });
    if (msgs.length) {
      return new Error(msgs);
    }
  }

  var secret = {};
  var logCallbacks = {};
  var logFnNames = [
    "begin", "done", "moduleStart", "moduleDone", "testStart", "testDone",
    "log"
  ];
  var log = function(name, context) {
    logCallbacks[name].forEach(function(callback) {
      callback.call(QUnit, context);
    });
  };
  logFnNames.forEach(function(fnName) {
    var callbacks = logCallbacks[fnName] = [];
    QUnit[fnName] = function(callback) {
      if (typeof callback !== "function") { return; }
      callbacks.push(callback);
    };
  });

  var assertMessages = {
    equal: function(actual, expected) {
      return 'expected ' + actual + ' to equal ' + expected;
    },
    notEqual: function(actual, expected) {
      return 'expected ' + actual + ' to not equal ' + expected;
    },
    propEqual: function(actual, expected) {
      return 'expected ' + actual + ' to prop equal ' + expected;
    },
    notPropEqual: function(actual, expected) {
      return 'expected ' + actual + ' to not prop equal ' + expected;
    },
    strictEqual: function(actual, expected) {
      return 'expected ' + actual + ' to strictly equal ' + expected;
    },
    notStrictEqual: function(actual, expected) {
      return 'expected ' + actual + ' to not strictly equal ' + expected;
    },
    deepEqual: function(actual, expected) {
      return 'expected ' + actual + ' to deeply equal ' + expected;
    },
    notDeepEqual: function(actual, expected) {
      return 'expected ' + actual + ' to not deeply equal ' + expected;
    }
  };
  for (var key in assertMessages) {
    if (assertMessages.hasOwnProperty(key)) {
      (function(key, orig) {
        assert[key] = global[key] = function(a, b, message) {
          var assertions = config.current._assertions;
          var latest;
          orig.apply(this, arguments);
          latest = assertions[assertions.length - 1];

          latest.message = message || '';
          if (message) {
            latest.message += ': ';
          }
          latest.message += assertMessages[key](
            QUnit.jsDump.parse(a),
            QUnit.jsDump.parse(b)
          );
        };
      }(key, assert[key]));
    }
  }

  var push = QUnit.push;
  var ok = assert.ok;
  var spy = function(obj, name, fn) {
    var orig = obj[name];
    if (orig.reset) {
      orig = orig.reset();
    }
    var spied = obj[name] = function() {
      var res = orig.apply(this, arguments);
      fn.apply(this, arguments);
      return orig.apply(this, arguments);
    };
    spied.reset = function() {
      obj[name] = orig;
      return orig;
    };
  };
  QUnit.log(function(details) {
    var assertions = config.current.assertions;
    var last = assertions[assertions.length - 1];
    last.message = details.message;
  });
  var setLog = function(logDetails) {
    spy(QUnit, "push", function(result, actual, expected, message) {
      config.current._assertions.push({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
      log("log", {
        name: logDetails.name,
        module: logDetails.module,
        result: result,
        message: message,
        actual: actual,
        expected: expected
      });
    });
    spy(assert, "ok", function(result, message) {
      // TODO: Extend facility for assertion message overriding to allow
      // argument type specification and move this logic there.
      if (message === undefined) {
        message = "expected " + QUnit.jsDump.parse(result) + " to be ok";
      }

      config.current._assertions.push({
        result: result,
        actual: result,
        expected: true,
        message: message
      });
      log("log", {
        name: logDetails.name,
        module: logDetails.module,
        result: result,
        message: message
      });
    });
  };

  suite.on('pre-require', function(context) {

    /**
     * Describe a "suite" with the given `title`.
     */

    context.module = QUnit.module = function(title, opts) {
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      var originalFixture;
      suites.unshift(suite);
      if (isBrowser) {
        originalFixture = document.getElementById("qunit-fixture").innerHTML;
      }
      var assertionCounts = {
        total: 0,
        passed: 0,
        failed: 0
      };

      suite.beforeAll(function() {
        log("moduleStart", { name: title });
      });

      suite.afterAll(function() {
        log("moduleDone", {
          name: title,
          total: assertionCounts.total,
          passed: assertionCounts.passed,
          failed: assertionCounts.failed
        });
      });

      suite.beforeEach(function() {
        checkingDeferrals = false;
        if (isBrowser) {
          document.getElementById("qunit-fixture").innerHTML = originalFixture;
        }
        deferrals = 0;
        inModule = true;
        setContext(this);

        var logData = { name: this.currentTest.title, module: title };
        setLog(logData);

        log("testStart", logData);
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
        config.current._assertions.forEach(function(assertion) {
          var state = test.state;
          assertionCounts.total++;
          if (assertion.result) {
            assertionCounts.passed++;
          } else {
            assertionCounts.failed++;
          }
        });

        log("testDone", {
          module: title,
          total: assertionCounts.total,
          passed: assertionCounts.passed,
          failed: assertionCounts.failed,
          name: this.currentTest.title,
          duration: this.currentTest.duration
        });
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
      var actualCount = config.current._assertions.length;
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
        if (firstTest) {
          log("begin");
          firstTest = false;
        }
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
