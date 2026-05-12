import { describe, it, expect } from 'vitest';

describe('Cart Store', () => {
  it('can be imported', () => {
    const { useCart } = require('./cart');
    expect(useCart).toBeDefined();
    expect(typeof useCart).toBe('function');
  });
});