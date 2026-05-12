import { describe, it, expect } from 'vitest';

describe('Toast Store', () => {
  it('can be imported', () => {
    const { useToast } = require('./toast');
    expect(useToast).toBeDefined();
    expect(typeof useToast).toBe('function');
  });
});