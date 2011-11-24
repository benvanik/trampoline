function extend(childCtor, parentCtor) {
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
}

var EventEmitter = function() {
  this.listeners_ = {};
};

EventEmitter.prototype.addListener = function(eventName, listener) {
  var listeners = this.listeners_[eventName];
  if (!listeners) {
    listeners = this.listeners_[eventName] = [];
  }
  listeners.push(listener);
};

EventEmitter.prototype.removeAllListeners = function() {
  this.listeners_ = {};
};

EventEmitter.prototype.emit = function(eventName) {
  var args = new Array(arguments.length - 1);
  for (var n = 1; n< arguments.length; n++) {
    args[n - 1] = arguments[n];
  }
  var listeners = this.listeners_[eventName];
  if (listeners) {
    for (var n = 0; n < listeners.length; n++) {
      var listener = listeners[n];
      listener.apply(window, args);
    }
  }
};
