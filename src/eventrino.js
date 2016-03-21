'use strict';

const eventrino = {};
let _eventList = {};
let _listenerQueue = new Map();

/**
 * Creates a Symbol for a string if needed
 * @param {string|Symbol}
 * @private
 */
const _getSymbol = (value) => {
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
 * @param {object|string} context - the context where the event exists
 * @param {string|symbol} identifier - the identifier of the event listener
 * @private
 */
const _unsubscribeByIdentifier = function(event, context, identifier) {
  let id = _getSymbol(identifier);

  // Check if the identifier of the listener exists
  if (_listenerQueue.get(id)) {
    // Get all the listeners for that context and removes the correct one
    let listeners = _eventList[event].get(context);

    if (listeners.includes(id)) {
      _listenerQueue.delete(id);
      listeners.splice(listeners.indexOf(id), 1);

      // If there are no more listeners after the removal, delete the context
      if (listeners.length) {
        _eventList[event].set(context, listeners);
      } else {
        _eventList[event].delete(context);
      }

      // If there are no more listeners for this event, delete the event
      if (!_eventList[event].size) {
        delete _eventList[event];
      }
    }
  }
};

/**
 * Removes a listener by the reference to the function. It searches the function in
 * the event queue and if it finds it, it calls the unsubscribeByIndentifier() function
 * with the identifier of the listener
 * @param {string} event - the event name
 * @param {object|string} context - the context where the event exists
 * @param {function} fn - the function reference to the listener that needs to be removed
 * @private
 */
const _unsubscribeByListener = function(event, context, fn) {
  _listenerQueue.forEach((listener, identifier) => {
    if (listener === fn) {
      _unsubscribeByIdentifier(event, context, identifier);
    }
  });
};

/**
 * Removes all the event listeners from a context (can be the global context or an object)
 * @param {string} event - the event name
 * @param {object|string} context - the context where the event exists
 * @private
 */
const _unsubscribeAllListeners = function(event, context) {
  // Gets all listeners of an event from a context
  let listeners = _eventList[event].get(context);

  // Deletes them from the listener queue
  for (var i = 0; i < listeners.length; i++) {
    _listenerQueue.delete(listeners[i]);
  }

  // All the listeners from the context were removed, so the context is no longer needed
  _eventList[event].delete(context);

  // If the event doesn't have any more listeners, clear up the memory
  if (!_eventList[event].size) {
    delete _eventList[event];
  }
};

/**
 * Adds an event listener
 * @param {string} event - the event name
 * @param {function} fn - the event listener
 * @param {string|symbol} [identifier] - can be used to reference the listener after it's added
 * @param {object|string} [context=global] - the object where the listener will be attached
 * @param {object} [binding=null] - the listener will be bounded to this object
 * @public
 */
eventrino.subscribe = function(event, fn, identifier, context = 'global', binding = null) {
  const listenerId = identifier ? _getSymbol(identifier) : Symbol();
  let listeners;

  // Duplicate identifiers for listeners are not allowed
  if (_listenerQueue.has(listenerId)) {
    throw new Error('You can\'t override an existing listener identifier. You must unsubscribe it first');
  }

  // Create the map for this event if the event doesnt exist in the event list
  if (!_eventList[event]) {
    _eventList[event] = new Map();
  }

  // Add the context for the event if the event doesn't have it
  if (!_eventList[event].has(context)) {
    _eventList[event].set(context, []);
  }

  // Add the identifier to the event list and the the function in the listener queue
  listeners = _eventList[event].get(context);
  listeners.push(listenerId);
  _eventList[event].set(context, listeners);
  _listenerQueue.set(listenerId, binding ? fn.bind(binding) : fn);

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
 * @param {object|string} [context=global] - the context where the listener exists
 * @public
 */
eventrino.unsubscribe = function(event, listener, context = 'global') {
  if (_contextExists(event, context)) {
    if (!listener) {
      _unsubscribeAllListeners(event, context);
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
 * @param {object|string} [context=global] - will only trigger the event in this context
 * @param {object} [data] - the listeners of the event will be called with this object
 * @public
 */
eventrino.broadcast = function(event, context = 'global', data = undefined) {
  if (_contextExists(event, context)) {
    let listeners = _eventList[event].get(context);

    if (typeof data !== 'undefined') {
      for (let i = 0; i < listeners.length; i++) {
        _listenerQueue.get(listeners[i]).call(null, data);
      }
    } else {
      for (let i = 0; i < listeners.length; i++) {
        _listenerQueue.get(listeners[i])();
      }
    }
  }
};

module.exports = eventrino;