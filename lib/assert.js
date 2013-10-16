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
