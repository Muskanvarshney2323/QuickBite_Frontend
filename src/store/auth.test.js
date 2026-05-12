import { describe, it, expect, vi } from 'vitest';

// Mock the API client
vi.mock('../api/client', () => ({
  API: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Auth Store', () => {
  it('has auth store file', async () => {
    // Import the auth module
    const { useAuthStore } = await import('./auth');
    expect(useAuthStore).toBeDefined();
  });
});