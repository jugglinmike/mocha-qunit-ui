/* exported forEach */
var nativeForEach = Array.prototype.forEach;
var oKeys = Object.keys || function(obj) {
  var key, keys;

  if (obj !== Object(obj)) {
    throw new TypeError('Invalid object');
  }

  keys = [];

  for (key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      keys.push(key);
    }
  }

  return keys;
};

var forEach = function(obj, iterator, context) {
  var keys, i, length;

  if (obj === null || obj === undefined) {
    return;
  }

  if (nativeForEach && obj.forEach === nativeForEach) {
    obj.forEach(iterator, context);
  } else {
    keys = oKeys(obj);

    for (i = 0, length = keys.length; i < length; i++) {
      iterator.call(context, obj[keys[i]], keys[i], obj);
    }
  }
};
