/* exported bind */
var nativeBind = Function.prototype.bind;
var slice = Array.prototype.slice;

var bind = function(func, context) {
  var args, bound;

  if (nativeBind && func.bind === nativeBind) {
    return nativeBind.apply(func, slice.call(arguments, 1));
  }

  if (typeof func !== 'function') {
    throw new TypeError();
  }

  args = slice.call(arguments, 2);

  bound = function() {
    var self, result, ctor;

    if (!(this instanceof bound)) {
      return func.apply(context, args.concat(slice.call(arguments)));
    }

    ctor.prototype = func.prototype;
    self = new ctor();
    ctor.prototype = null;
    result = func.apply(self, args.concat(slice.call(arguments)));

    if (Object(result) === result) {
      return result;
    }

    return self;
  };

  return bound;
};
