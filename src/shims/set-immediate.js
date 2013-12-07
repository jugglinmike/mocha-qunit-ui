var setImmediate = global.setImmediate || (function() {
  // This implementation based on dbaron's work in "setTimeout with a shorter
  // delay"
  // http://dbaron.org/log/20100309-faster-timeouts
  var timeouts = [];
  var messageName = "zero-timeout-message";

  function handleMessage(event) {
    if (event.source == window && event.data == messageName) {
      event.stopPropagation();
      if (timeouts.length > 0) {
        timeouts.shift()();
      }
    }
  }

  window.addEventListener("message", handleMessage, true);

  return function(fn) {
    timeouts.push(fn);
    window.postMessage(messageName, "*");
  };
}());
