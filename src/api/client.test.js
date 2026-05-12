import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  // Mock import.meta.env
  vi.stubGlobal('import.meta', {
    env: {
      VITE_API_BASE_URL: 'http://localhost:5000',
    },
  });
});

describe('API Client', () => {
  it('can be imported', async () => {
    const apiClient = await import('./client');
    expect(apiClient).toBeDefined();
    expect(typeof apiClient).toBe('object');
  });

  it('provides API methods', async () => {
    const { API } = await import('./client');
    expect(API).toBeDefined();
    expect(API.register).toBeDefined();
    expect(API.login).toBeDefined();
  });

  it('normalizes order total using computed final amount when tax and delivery are present', async () => {
    const { calculateOrderTotal } = await import('./client');

    const total = calculateOrderTotal({
      total: 349,
      amount: 349,
      tax: 17,
      deliveryCharge: 0,
    });

    expect(total).toBe(366);
  });

  it('normalizes order total from nested orderSummary fields', async () => {
    const { calculateOrderTotal } = await import('./client');

    const total = calculateOrderTotal({
      orderSummary: {
        total: 349,
        amount: 349,
        tax: 17,
        deliveryCharge: 0,
      },
    });

    expect(total).toBe(366);
  });
});