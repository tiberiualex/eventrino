# eventrino
eventrino is a JavaScript micro-library for event handling. It's an implementation of the publisher/subscriber pattern.

#### Features
- Events and listeners scoped to objects. You can have listeners that only listen for events triggered on specific objects.
- Easy to remove anonymous listeners or listeners that don't exist in the current scope.
- Pass data to listeners when you broadcast an event.
- The listeners for events on an object that has been garbage collected are garbage collected as well.
- No dependencies (although I strongly recommend using `babel-polyfill`)

#### Usage

eventrino allows you to pass a string or a Symbol as an identifier for a listener. The identifier can be used to remove anonymous listener or to remove listeners that don't exist in a certain scope. String indentifiers are converted to Symbols. If you don't pass an identifier, eventrino will create one for you and will return it.

`var eventrino = require('eventrino');`

##### Adding an event listener
- `eventrino.subscribe('event', listenerFunction);` // Adds a global listener
- `const identifier = eventrino.subscribe('event', listenerFunction);` // Adds a global listener and saves the identifier for it
- `eventrino.subscribe('event', listenerFunction, 'function identifier', testObject);` // Adds an event listener for `testObject` with the identifier `function identifier`

##### Removing an event listener
- `eventrino.unsubscribe('event', listenerFunction);` // Removes a global listener by function reference
- `eventrino.unsubscribe('event', 'listener identifier');` // Removes a global listener by its indentifier
- `eventrino.unsubscribe('event', 'listener identifier', testObject);` // Removes a listener of an object by its identifier
- `eventrino.unsubscribe('event', undefined, testObject);` // Removes all listeners of an object

##### Broadcasting events
- `eventrino.broadcast('event');` // Broadcasts a global event
- `eventrino.broacast('event', undefined, dataObject);` // Broadcasts a global event and calls all the listeners with `dataObject`
- `eventrino.broadcast('event', testObject);` // Broadcast the event only for `testObject`

#### License
MIT