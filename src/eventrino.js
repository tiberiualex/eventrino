'use strict';

const eventrino = {};
const _global = {};
let _eventList = {};

/**
 * Creates a Symbol for a string if needed
 * @param {string|Symbol}
 * @private
 */
const _getSymbol = value => {
  return (typeof value === 'string') ? Symbol.for(value): value;
};

/**
 * Checks if there are any events for a context
 * @param {string} event - the event name
 * @param {object|string} context - the context where the event exists
 * @private
 */
const _contextExists = (event, context) => {
  return (_eventList[event] && _eventList[event].has(context)) ? true : false;
};

/**
 * Removes a listener by its symbol or string identifier
 * @param {string} event - the event name
 * @param {object} context - the context where the event exists
 * @param {string|symbol} identifier - the identifier of the event listener
 * @private
 */
const _unsubscribeByIdentifier = function(event, context, identifier) {
  let listenerId = _getSymbol(identifier);
  let listeners = _eventList[event].get(context);

  if (listeners.has(listenerId)) {
    listeners.delete(listenerId);

    if (listeners.size) {
      _eventList[event].set(context, listeners);
    } else {
      _eventList[event].delete(context);
    }
  }
};

/**
 * Removes a listener by the reference to the function
 * @param {string} event - the event name
 * @param {object} context - the context where the event exists
 * @param {function} fn - the function reference to the listener that needs to be removed
 * @private
 */
const _unsubscribeByListener = function(event, context, fn) {
  let listeners = _eventList[event].get(context);

  listeners.forEach((listener, key) => {
    if (listener === fn) listeners.delete(key);
  });

  if (listeners.size) {
    _eventList[event].set(context, listeners);
  } else {
    _eventList[event].delete(context);
  }
};

/**
 * Adds an event listener
 * @param {string} event - the event name
 * @param {function} fn - the event listener
 * @param {string|symbol} [identifier] - can be used to reference the listener after it's added
 * @param {object} [context=_global] - the object that the listener will be attached to
 * @public
 */
eventrino.subscribe = function(event, fn, identifier, context = _global) {
  const listenerId = identifier ? _getSymbol(identifier) : Symbol();
  let listeners;

  if (!_eventList[event]) {
    _eventList[event] = new WeakMap();
  }

  if (!_eventList[event].has(context)) {
    _eventList[event].set(context, new Map());
  }

  listeners = _eventList[event].get(context);

  if (listeners.has(listenerId)) {
    throw new Error('You can\'t override an existing listener identifier for a context. You must unsubscribe it first');
  }

  listeners.set(listenerId, fn);
  _eventList[event].set(context, listeners);

  /*
    Returns the indentifier of the listener. Useful if no string or symbol identifier was passed
    Makes it easy to remove the listener
  */
  return listenerId;
};

/**
 * Removes an event listener. If no listener is passed, it will remove all listeners
 * from a context. If no context is passed, it will remove the global listeners
 * @param {string} event - the name of the event
 * @param {string|symbol|function} [listener] - the reference to the listener
 * @param {object} [context=_global] - the context where the listener exists
 * @public
 */
eventrino.unsubscribe = function(event, listener, context = _global) {
  if (_contextExists(event, context)) {
    if (!listener) {
      _eventList[event].delete(context);
    } else if (typeof listener === 'function') {
      _unsubscribeByListener(event, context, listener);
    } else {
      _unsubscribeByIdentifier(event, context, listener);
    }
  }
};

/**
 * Fires an event (calls the listeners). The method can call the listeners with an object
 * of data, without changing the value of 'this' inside the listeners. If no context is
 * passed, it will trigger a global event
 * @param {string} event - the event name
 * @param {object} [context=_global] - will only trigger the event in this context
 * @param {object} [data] - the listeners of the event will be called with this object
 * @public
 */
eventrino.broadcast = function(event, context = _global, data = undefined) {
  if (_contextExists(event, context)) {
    let listeners = _eventList[event].get(context);

    if (typeof data !== 'undefined') {
      listeners.forEach(listener => {
        listener.call(null, data);
      });
    } else {
      listeners.forEach(listener => {
        listener();
      });
    }
  }
};

module.exports = eventrino;
