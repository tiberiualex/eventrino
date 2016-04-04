/* globals */

'use strict';

require('babel-register');
require('babel-polyfill');
var stub = require('sinon').stub;
var spy = require('sinon').spy;
var eventrino = require('../src/eventrino');

describe('Eventrino: ', function() {
  // Subscribing to events. Tested by broadcasting the events
  describe('when adding listeners for an event', function() {
    beforeEach(function() {
      this.callback1 = stub();
      this.callback2 = stub();
      this.event = this.event;
      this.context = {};
    });

    describe('to the global context', function() {
      beforeEach(function() {
        eventrino.subscribe(this.event, this.callback1);
        eventrino.subscribe(this.event, this.callback2);
        eventrino.broadcast(this.event);
      });

      it('should add all the listeners in the global event queue and call them if global event is fired', function() {
        expect(this.callback1.called).to.be.equal(true);
        expect(this.callback2.called).to.be.equal(true);
      });
    });

    describe('to a specific object context', function() {
      beforeEach(function() {

        eventrino.subscribe(this.event, this.callback1, 'test:identifier1', this.context);
        eventrino.subscribe(this.event, this.callback2, 'test:identifier2', this.context);
        eventrino.broadcast(this.event, this.context);
      });

      it('should add all the listeners in the object\'s context queue and call them if the event is fired', function() {
        expect(this.callback1.called).to.be.equal(true);
        expect(this.callback2.called).to.be.equal(true);
      });
    });

    describe('with identifiers that already exist', function() {
      beforeEach(function() {
        eventrino.subscribe(this.event, this.callback1, 'test:override', undefined, this.context);
      });

      it('should throw an error', function() {
        expect(function() {
          eventrino.subscribe(this.event, this.callback1, 'test:override', undefined, this.context);
        }).to.throw(Error);
      });
    });
  });

  // Broadcasting events
  describe('when broadcasting events', function() {
    beforeEach(function() {
      this.callback1 = spy();
      this.callback2 = spy();
    });

    describe('and passing data', function() {
      beforeEach(function() {
        this.data = { testdata: 'testdata' };
        eventrino.subscribe(this.event, this.callback1);
        eventrino.subscribe(this.event, this.callback2);
        eventrino.broadcast(this.event, undefined, this.data);
      });

      it('should call the listeners with that data', function() {
        expect(this.callback1.calledWith(this.data)).to.be.equal(true);
        expect(this.callback2.calledWith(this.data)).to.be.equal(true);
      });
    });
  });

  // Removing events. Tested by firing events after the listeners were removed
  describe('when unsubscribing', function() {
    beforeEach(function() {
      this.callback1 = stub();
      this.callback2 = stub();
    });

    describe('a listener by function reference', function() {
      beforeEach(function() {
        eventrino.subscribe(this.event, this.callback1);
        eventrino.subscribe(this.event, this.callback2);
        eventrino.unsubscribe(this.event, this.callback1);
        eventrino.broadcast(this.event);
      });

      it('should only remove that listener', function() {
        expect(this.callback1.called).to.be.equal(false);
        expect(this.callback2.called).to.be.equal(true);
      });
    });

    describe('a listener by string identifier', function() {
      beforeEach(function() {
        eventrino.subscribe(this.event, this.callback1, 'test:callback1');
        eventrino.subscribe(this.event, this.callback2, 'test:callback2');
        eventrino.unsubscribe(this.event, 'test:callback1');
        eventrino.broadcast(this.event);
      });

      it('should only remove that listener', function() {
        expect(this.callback1.called).to.be.equal(false);
        expect(this.callback2.called).to.be.equal(true);
      });
    });

    describe('all listeners from a context', function() {
      beforeEach(function() {
        eventrino.subscribe(this.event, this.callback1, undefined, this.context);
        eventrino.subscribe(this.event, this.callback2, undefined, this.context);
        eventrino.unsubscribe(this.event, this.context);
        eventrino.broadcast(this.event, this.context);
      });

      it('should remove all the listeners for the event from that context', function() {
        expect(this.callback1.called).to.be.equal(false);
        expect(this.callback2.called).to.be.equal(false);
      });
    });
  });

  afterEach(function() {
    eventrino.unsubscribe(this.event);
    eventrino.unsubscribe(this.event, undefined, this.context);
  });
});
