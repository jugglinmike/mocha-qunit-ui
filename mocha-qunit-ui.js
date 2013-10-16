(function(global, undefined) {
"use strict";

/**
 * Makes a clone of an object using only Array or Object as base,
 * and copies over the own enumerable properties.
 *
 * @param {Object} obj
 * @return {Object} New object with only the own properties (recursively).
 */
var objectValues = function( obj ) {
  // Grunt 0.3.x uses an older version of jshint that still has jshint/jshint#392.
  /*jshint newcap: false */
  var key, val,
    vals = QUnit.is( "array", obj ) ? [] : {};
  for ( key in obj ) {
    if ( hasOwn.call( obj, key ) ) {
      val = obj[key];
      vals[key] = val === Object(val) ? objectValues(val) : val;
    }
  }
  return vals;
};
var hasOwn = Object.prototype.hasOwnProperty;

var assertFns = {
  ok: function(val) {
    if (!val) {
      throw new Error("Expected " + val + " to be truthy");
    }
  },
  equal: function(val1, val2, userMsg) {
    var msg = "Expected " + val1 + " to equal " + val2;
    if (userMsg) {
      msg = userMsg + ": " + msg;
    }
    if (val1 != val2) {
      throw new Error(msg);
    }
  },
  notStrictEqual: function(val1, val2, userMsg) {
    var msg = "Expected " + val1 + " to strictly equal " + val2;
    if (userMsg) {
      msg = userMsg + ": " + msg;
    }
    if (val1 !== val2) {
      throw new Error(msg);
    }
  },
  deepEqual: function(val1, val2, userMsg) {
    var msg = "Expected " + val1 + " to deeply equal " + val2;
    if (userMsg) {
      msg = userMsg + ": " + msg;
    }
    if (!_deepEqual(val1, val2)) {
      throw new Error(msg);
    }
  },
  propEqual: function(actual, expected, userMsg) {
    var msg = "Expected " + actual + " to propEqual " + expected;
    if (userMsg) {
      msg = userMsg + ": " + msg;
    }
    if (!_deepEqual(objectValues(actual), objectValues(expected))) {
      throw new Error(msg);
    }
  },
  notPropEqual: function(actual, expected, userMsg) {
    var msg = "Expected " + actual + " to not propEqual " + expected;
    if (userMsg) {
      msg = userMsg + ": " + msg;
    }
    console.log(objectValues(actual), objectValues(expected));
    if (_deepEqual(objectValues(actual), objectValues(expected))) {
      throw new Error(msg);
    }
  }
};

var toString = Object.prototype.toString;
var util = {};
['RegExp', 'Arguments', 'Date'].forEach(function(name) {
  util['is' + name] = function(obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
});
util.isObject = function(obj) {
  return obj === Object(obj);
};
util.isNullOrUndefined = function(obj) {
  return obj == null;
};

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (util.isArguments(a)) {
    if (!util.isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}
// Safe object type checking
var is = function( type, obj ) {
  return QUnit.objectType( obj ) === type;
};

var objectType = function( obj ) {
  if ( typeof obj === "undefined" ) {
      return "undefined";
  // consider: typeof null === object
  }
  if ( obj === null ) {
      return "null";
  }

  var match = toString.call( obj ).match(/^\[object\s(.*)\]$/),
    type = match && match[1] || "";

  switch ( type ) {
    case "Number":
      if ( isNaN(obj) ) {
        return "nan";
      }
      return "number";
    case "String":
    case "Boolean":
    case "Array":
    case "Date":
    case "RegExp":
    case "Function":
      return type.toLowerCase();
  }
  if ( typeof obj === "object" ) {
    return "object";
  }
  return undefined;
};
var jsDump = (function() {
  // from jquery.js
  function inArray( elem, array ) {
    if ( array.indexOf ) {
      return array.indexOf( elem );
    }

    for ( var i = 0, length = array.length; i < length; i++ ) {
      if ( array[ i ] === elem ) {
        return i;
      }
    }

    return -1;
  }

  function quote( str ) {
    return "\"" + str.toString().replace( /"/g, "\\\"" ) + "\"";
  }
  function literal( o ) {
    return o + "";
  }
  function join( pre, arr, post ) {
    var s = jsDump.separator(),
      base = jsDump.indent(),
      inner = jsDump.indent(1);
    if ( arr.join ) {
      arr = arr.join( "," + s + inner );
    }
    if ( !arr ) {
      return pre + post;
    }
    return [ pre, inner + arr, base + post ].join(s);
  }
  function array( arr, stack ) {
    var i = arr.length, ret = new Array(i);
    this.up();
    while ( i-- ) {
      ret[i] = this.parse( arr[i] , undefined , stack);
    }
    this.down();
    return join( "[", ret, "]" );
  }

  var reName = /^function (\w+)/,
    jsDump = {
      // type is used mostly internally, you can fix a (custom)type in advance
      parse: function( obj, type, stack ) {
        stack = stack || [ ];
        var inStack, res,
          parser = this.parsers[ type || this.typeOf(obj) ];

        type = typeof parser;
        inStack = inArray( obj, stack );

        if ( inStack !== -1 ) {
          return "recursion(" + (inStack - stack.length) + ")";
        }
        if ( type === "function" )  {
          stack.push( obj );
          res = parser.call( this, obj, stack );
          stack.pop();
          return res;
        }
        return ( type === "string" ) ? parser : this.parsers.error;
      },
      typeOf: function( obj ) {
        var type;
        if ( obj === null ) {
          type = "null";
        } else if ( typeof obj === "undefined" ) {
          type = "undefined";
        } else if ( QUnit.is( "regexp", obj) ) {
          type = "regexp";
        } else if ( QUnit.is( "date", obj) ) {
          type = "date";
        } else if ( QUnit.is( "function", obj) ) {
          type = "function";
        } else if ( typeof obj.setInterval !== undefined && typeof obj.document !== "undefined" && typeof obj.nodeType === "undefined" ) {
          type = "window";
        } else if ( obj.nodeType === 9 ) {
          type = "document";
        } else if ( obj.nodeType ) {
          type = "node";
        } else if (
          // native arrays
          toString.call( obj ) === "[object Array]" ||
          // NodeList objects
          ( typeof obj.length === "number" && typeof obj.item !== "undefined" && ( obj.length ? obj.item(0) === obj[0] : ( obj.item( 0 ) === null && typeof obj[0] === "undefined" ) ) )
        ) {
          type = "array";
        } else if ( obj.constructor === Error.prototype.constructor ) {
          type = "error";
        } else {
          type = typeof obj;
        }
        return type;
      },
      separator: function() {
        return this.multiline ? this.HTML ? "<br />" : "\n" : this.HTML ? "&nbsp;" : " ";
      },
      // extra can be a number, shortcut for increasing-calling-decreasing
      indent: function( extra ) {
        if ( !this.multiline ) {
          return "";
        }
        var chr = this.indentChar;
        if ( this.HTML ) {
          chr = chr.replace( /\t/g, "   " ).replace( / /g, "&nbsp;" );
        }
        return new Array( this.depth + ( extra || 0 ) ).join(chr);
      },
      up: function( a ) {
        this.depth += a || 1;
      },
      down: function( a ) {
        this.depth -= a || 1;
      },
      setParser: function( name, parser ) {
        this.parsers[name] = parser;
      },
      // The next 3 are exposed so you can use them
      quote: quote,
      literal: literal,
      join: join,
      //
      depth: 1,
      // This is the list of parsers, to modify them, use jsDump.setParser
      parsers: {
        window: "[Window]",
        document: "[Document]",
        error: function(error) {
          return "Error(\"" + error.message + "\")";
        },
        unknown: "[Unknown]",
        "null": "null",
        "undefined": "undefined",
        "function": function( fn ) {
          var ret = "function",
            // functions never have name in IE
            name = "name" in fn ? fn.name : (reName.exec(fn) || [])[1];

          if ( name ) {
            ret += " " + name;
          }
          ret += "( ";

          ret = [ ret, QUnit.jsDump.parse( fn, "functionArgs" ), "){" ].join( "" );
          return join( ret, QUnit.jsDump.parse(fn,"functionCode" ), "}" );
        },
        array: array,
        nodelist: array,
        "arguments": array,
        object: function( map, stack ) {
          /*jshint forin:false */
          var ret = [ ], keys, key, val, i;
          QUnit.jsDump.up();
          keys = [];
          for ( key in map ) {
            keys.push( key );
          }
          keys.sort();
          for ( i = 0; i < keys.length; i++ ) {
            key = keys[ i ];
            val = map[ key ];
            ret.push( QUnit.jsDump.parse( key, "key" ) + ": " + QUnit.jsDump.parse( val, undefined, stack ) );
          }
          QUnit.jsDump.down();
          return join( "{", ret, "}" );
        },
        node: function( node ) {
          var len, i, val,
            open = QUnit.jsDump.HTML ? "&lt;" : "<",
            close = QUnit.jsDump.HTML ? "&gt;" : ">",
            tag = node.nodeName.toLowerCase(),
            ret = open + tag,
            attrs = node.attributes;

          if ( attrs ) {
            for ( i = 0, len = attrs.length; i < len; i++ ) {
              val = attrs[i].nodeValue;
              // IE6 includes all attributes in .attributes, even ones not explicitly set.
              // Those have values like undefined, null, 0, false, "" or "inherit".
              if ( val && val !== "inherit" ) {
                ret += " " + attrs[i].nodeName + "=" + QUnit.jsDump.parse( val, "attribute" );
              }
            }
          }
          ret += close;

          // Show content of TextNode or CDATASection
          if ( node.nodeType === 3 || node.nodeType === 4 ) {
            ret += node.nodeValue;
          }

          return ret + open + "/" + tag + close;
        },
        // function calls it internally, it's the arguments part of the function
        functionArgs: function( fn ) {
          var args,
            l = fn.length;

          if ( !l ) {
            return "";
          }

          args = new Array(l);
          while ( l-- ) {
            // 97 is 'a'
            args[l] = String.fromCharCode(97+l);
          }
          return " " + args.join( ", " ) + " ";
        },
        // object calls it internally, the key part of an item in a map
        key: quote,
        // function calls it internally, it's the content of the function
        functionCode: "[code]",
        // node calls it internally, it's an html attribute value
        attribute: quote,
        string: quote,
        date: quote,
        regexp: literal,
        number: literal,
        "boolean": literal
      },
      // if true, entities are escaped ( <, >, \t, space and \n )
      HTML: false,
      // indentation unit
      indentChar: "  ",
      // if true, items in a collection, are separated by a \n, else just a space.
      multiline: true
    };

  return jsDump;
}());
var Mocha = global.Mocha;
var Suite = Mocha.Suite;
var Test = Mocha.Test;

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
    [
      "deepEqual", "equal", "notDeepEqual", "notEqual", "propEqual",
      "notPropEqual", "notStrictEqual","ok","strictEqual","throws"
    ].forEach(function(k) {
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
        context.config.current.testEnvironment = this;
        context.current_testEnvironment = this;
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

    context.assert = assert;
    realContext.QUnit = context;
    context.config = { current: {} };
    context.jsDump = jsDump;
    context.is = is;
    context.objectType = objectType;
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
