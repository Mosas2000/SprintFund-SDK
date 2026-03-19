import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter, EventConfig, createEventEmitter } from '../realtime/event-emitter';

describe('Real-time Notifications', () => {
  describe('Event Emitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
      emitter = createEventEmitter();
    });

    it('should create event emitter', () => {
      expect(emitter).toBeDefined();
      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should subscribe to events', () => {
      const handler = vi.fn();
      emitter.on('test', handler);

      expect(emitter.getListenerCount()).toBe(1);
    });

    it('should emit events to subscribers', () => {
      const handler = vi.fn();
      emitter.on('test', handler);

      const event: EventConfig = {
        type: 'test',
        data: { value: 42 },
        timestamp: Date.now(),
        id: 'test-1'
      };

      emitter.emit(event);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should support unsubscribing', () => {
      const handler = vi.fn();
      const unsubscribe = emitter.on('test', handler);

      emitter.emit({
        type: 'test',
        data: {},
        timestamp: Date.now(),
        id: 'test-1'
      });

      unsubscribe();

      emitter.emit({
        type: 'test',
        data: {},
        timestamp: Date.now(),
        id: 'test-2'
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support one-time listeners', () => {
      const handler = vi.fn();
      emitter.once('test', handler);

      emitter.emit({
        type: 'test',
        data: {},
        timestamp: Date.now(),
        id: 'test-1'
      });

      emitter.emit({
        type: 'test',
        data: {},
        timestamp: Date.now(),
        id: 'test-2'
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support wildcard listeners', () => {
      const handler = vi.fn();
      emitter.on('*', handler);

      emitter.emit({
        type: 'event1',
        data: {},
        timestamp: Date.now(),
        id: 'test-1'
      });

      emitter.emit({
        type: 'event2',
        data: {},
        timestamp: Date.now(),
        id: 'test-2'
      });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should buffer events', () => {
      const event1: EventConfig = {
        type: 'test',
        data: { id: 1 },
        timestamp: Date.now(),
        id: 'test-1'
      };

      const event2: EventConfig = {
        type: 'test',
        data: { id: 2 },
        timestamp: Date.now(),
        id: 'test-2'
      };

      emitter.emit(event1);
      emitter.emit(event2);

      const buffer = emitter.getBuffer();
      expect(buffer).toHaveLength(2);
      expect(buffer[0]).toEqual(event1);
      expect(buffer[1]).toEqual(event2);
    });

    it('should clear event buffer', () => {
      emitter.emit({
        type: 'test',
        data: {},
        timestamp: Date.now(),
        id: 'test-1'
      });

      emitter.clearBuffer();
      expect(emitter.getBuffer()).toHaveLength(0);
    });

    it('should remove all listeners', () => {
      emitter.on('test1', () => {});
      emitter.on('test2', () => {});

      expect(emitter.getListenerCount()).toBe(2);

      emitter.removeAllListeners();
      expect(emitter.getListenerCount()).toBe(0);
    });
  });

  describe('Event Types', () => {
    it('should support proposal events', () => {
      const emitter = new EventEmitter();
      const handler = vi.fn();

      emitter.on('proposal.created', handler);

      const event: EventConfig = {
        type: 'proposal.created',
        data: { proposalId: 'prop-1', title: 'New Proposal' },
        timestamp: Date.now(),
        id: 'event-1'
      };

      emitter.emit(event);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should support vote events', () => {
      const emitter = new EventEmitter();
      const handler = vi.fn();

      emitter.on('vote.cast', handler);

      const event: EventConfig = {
        type: 'vote.cast',
        data: { proposalId: 'prop-1', weight: 10 },
        timestamp: Date.now(),
        id: 'event-1'
      };

      emitter.emit(event);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should support error events', () => {
      const emitter = new EventEmitter();
      const handler = vi.fn();

      emitter.on('error', handler);

      const event: EventConfig = {
        type: 'error',
        data: { message: 'Connection failed' },
        timestamp: Date.now(),
        id: 'error-1'
      };

      emitter.emit(event);
      expect(handler).toHaveBeenCalledWith(event);
    });
  });

  describe('Error Handling', () => {
    it('should handle listener errors gracefully', () => {
      const emitter = new EventEmitter();
      const errorHandler = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      emitter.on('test', () => {
        throw new Error('Listener error');
      });

      emitter.on('test', errorHandler);

      emitter.emit({
        type: 'test',
        data: {},
        timestamp: Date.now(),
        id: 'test-1'
      });

      // Second listener should still be called despite first listener error
      expect(errorHandler).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
