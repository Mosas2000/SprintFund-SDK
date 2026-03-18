import { describe, it, expect } from 'vitest';
import { SimpleCache } from '../src/utils/cache.js';

describe('SimpleCache', () => {
  it('should store and retrieve values', () => {
    const cache = new SimpleCache();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should check key existence', () => {
    const cache = new SimpleCache();
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete values', () => {
    const cache = new SimpleCache();
    cache.set('key1', 'value1');
    cache.delete('key1');
    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all values', () => {
    const cache = new SimpleCache();
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
  });

  it('should support custom TTL', async () => {
    const cache = new SimpleCache();
    cache.set('key1', 'value1', 100); // 100ms TTL
    expect(cache.get('key1')).toBe('value1');
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should invalidate by pattern', () => {
    const cache = new SimpleCache();
    cache.set('user:1', 'alice');
    cache.set('user:2', 'bob');
    cache.set('post:1', 'hello');

    const count = cache.invalidatePattern(/^user:/);
    expect(count).toBe(2);
    expect(cache.has('user:1')).toBe(false);
    expect(cache.has('post:1')).toBe(true);
  });

  it('should support different types', () => {
    const cache = new SimpleCache();
    cache.set('string', 'text');
    cache.set('number', 42);
    cache.set('object', { key: 'value' });
    cache.set('array', [1, 2, 3]);

    expect(cache.get('string')).toBe('text');
    expect(cache.get('number')).toBe(42);
    expect(cache.get('object')).toEqual({ key: 'value' });
    expect(cache.get('array')).toEqual([1, 2, 3]);
  });
});
